import {CommonModule, NgOptimizedImage} from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy, OnInit, signal,
  ViewChild
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatRipple} from '@angular/material/core';
import {Subject, takeUntil} from 'rxjs';
import {io, Socket} from 'socket.io-client';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import {UtilsService} from 'src/app/core/services/utils.service';
import {environment} from 'src/environments/environment';

import {ChatMsgDto, ChatRolesEnum, ChatSokcetResponse} from '../../models/chat.model';
import {ChatService} from '../../services/chat.service';
import {MatDialogClose} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {TranslateService, TranslateModule} from "@ngx-translate/core";
import {NgxMaskDirective} from "ngx-mask";
import {ToastrService} from "ngx-toastr";

@Component({
    selector: 'app-chat-conversation',
  imports: [TranslateModule, CommonModule, UiSvgIconComponent, ReactiveFormsModule, MatRipple, NgOptimizedImage, MatDialogClose, MatDivider, NgxMaskDirective],
    templateUrl: './chat-conversation.component.html',
    styles: `
    .triangle {
      position: relative;
      background-color: #F0F1EC;
      text-align: left;
    }

    .triangle:before {
      content: '';
      position: absolute;
      background-color: inherit;
    }

    .triangle,
    .triangle:before {
      width: 30px;
      height: 30px;
      border-top-right-radius: 30%;
    }

    .triangle {
      transform: rotate(-60deg) skewX(-30deg) scale(1, .866);
    }

    .triangle:before {
      transform: rotate(-135deg) skewX(-45deg) scale(1.414, .707) translate(0, -50%);
    }

    .triangle-user {
      position: relative;
      background-color: #bafff9;
      text-align: left;
    }

    .triangle-user:after {
      content: '';
      position: absolute;
      background-color: inherit;
    }

    .triangle-user,
    .triangle-user:after {
      width: 30px;
      height: 30px;
      border-top-right-radius: 30%;
    }

    .triangle-user {
      transform: rotate(-60deg) skewX(-30deg) scale(1, .866);
    }

    .triangle-user:after {
      transform: rotate(135deg) skewY(-45deg) scale(.707, 1.414) translate(50%);
    }

    .typing-container {
      display: flex;
      justify-content: flex-start;
    }

    .typing-content {
      display: flex;
    }

    .typing-content .typing-dots {
      height: 8px;
      width: 8px;
      background: #899391;
      border-radius: 20%;
      animation: animatedots 1.5s var(--delay) ease-in-out infinite;
    }

    .scrollable-container::-webkit-scrollbar {
      display: block;
    }

    /* Custom scrollbar styles for WebKit browsers */
    .scrollable-container::-webkit-scrollbar {
      width: 8px; /* Width of the scrollbar */
    }

    .scrollable-container::-webkit-scrollbar-thumb {
      background: rgb(207, 217, 229);
      border-radius: 5px;
    }

    .scrollable-container::-webkit-scrollbar-thumb:hover {
      background: rgb(124 136 151);
    }

    @keyframes animatedots {
      0%, 44% {
        transform: translateY(0px);
      }
      22% {
        opacity: 0.4;
        transform: translateY(-7px);
      }
      44% {
        opacity: 0.2;
        transform: translateY(0px);
      }
    }

    .typing-content .circle {
      border-radius: 50%;
    }
    .uploaded-file-container {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .uploaded-image {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 5px;
    }

    .file-icon {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .file-icon span {
      font-size: 40px;
      color: #007bff;
    }

    .clear-button {
      background: none;
      border: none;
      color: red;
      cursor: pointer;
      font-size: 16px;
    }

  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatConversationComponent implements OnDestroy, AfterViewChecked, OnInit {
  @ViewChild("msgContainer", {static: true}) msgContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  fileType: string = '';
  uploadedFileName: string = '';
  unsub$ = new Subject<void>();
  isSocketConnected = false;
  isTyping = false;
  chatSocket!: Socket;
  chatMessages: ChatMsgDto[] = [];
  previousMessageCount = 0;
  isFile: boolean = false
  heightWithFile: string = '84px'
  uploadedImage: any
  attachmentId: string = ''
  globalLang = signal<string>('')
  form = this.fb.nonNullable.group({msg: [null as unknown as string, Validators.required]});

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private utilsService: UtilsService,
    private cf: ChangeDetectorRef,
    private translateService: TranslateService,
    private toastrService: ToastrService,
  ) {
  }
ngOnInit() {
  if (this.translateService.instant('global.lang') && this.translateService.instant('global.lang') === 'ru') {
    this.globalLang.set('RUS');
  } else if (this.translateService.instant('global.lang') && this.translateService.instant('global.lang') === 'en') {
    this.globalLang.set('ENG');
  } else if (this.translateService.instant('global.lang') && this.translateService.instant('global.lang') === 'krl') {
    this.globalLang.set('KRL');
  } else if (this.translateService.instant('global.lang') && this.translateService.instant('global.lang') === 'uz') {
    this.globalLang.set('UZB');
  } else {
    this.globalLang.set('RUS');
  }
}
  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
    if (this.chatSocket) this.chatSocket.disconnect();
  }

  onConnectSocket() {
    this.utilsService.spinnerState$$.next(true);
    const chatApi = environment.API_CHAT;
    this.chatSocket = io(chatApi, {transports: ['websocket']});
    this.chatService.connectSocket().pipe(takeUntil(this.unsub$)).subscribe(res => {
      if (!res) return;
      this.utilsService.spinnerState$$.next(true);
      this.isSocketConnected = true;
      this.chatSocket.emit('init', res.content, this.globalLang());
      this.chatSocket.on('message', (msg: ChatMsgDto) => {
        if (msg.role === ChatRolesEnum.USER) {
          this.chatMessages.push(msg);
          this.cf.markForCheck();
          return;
        }
        this.isTyping = true;
        this.cf.markForCheck();
        const avgTypingSpeed = (msg.text.split(' ').length * 60) / 80;
        setTimeout(() => {
          this.isTyping = false;
          this.chatMessages.push(msg);
          this.cf.markForCheck();
        }, avgTypingSpeed * 100);
      });
      this.chatSocket.on('info', (chatResponse: ChatSokcetResponse) => {
        this.chatMessages = chatResponse.messageList;
        this.cf.markForCheck();
        this.utilsService.spinnerState$$.next(false);
        setTimeout(() => {
          const maxScroll = this.msgContainer?.nativeElement.scrollHeight;
          this.msgContainer?.nativeElement.scrollTo({top: maxScroll, behavior: 'smooth'});
        }, 0);
      });
    })
  }

  onSubmit() {
    if (this.form.valid || this.isFile) {
      if (this.isFile) {
        this.sendFile(this.attachmentId)
        this.clearFile()
        this.form.reset();
      } else {
        this.chatSocket.emit('chatMessage', this.form.controls.msg.value);
        this.form.reset();
      }
    }
  }

  uploadImage(event: any) {
    const target = event.target;
    const selectedFile = target.files[0];
    this.uploadedFileName = selectedFile.name;
    this.fileType = selectedFile.type.split('/')[1];
    const fileCategory = selectedFile.type.split('/')[0];

    const fileReader = new FileReader();
    fileReader.readAsDataURL(selectedFile);
    fileReader.onload = () => {
      this.utilsService.spinnerState$$.next(true);
      this.chatService.uploadChatImage(selectedFile).pipe(takeUntil(this.unsub$)).subscribe({
        next: (res) => {

          if (res['fileId']) {
            this.attachmentId = res['fileId'];
            if (fileCategory === 'image') {
              this.uploadedImage = fileReader.result;
            } else {
              this.uploadedImage = null;
            }
            this.isFile = true;
            this.heightWithFile = '84px';
            this.utilsService.spinnerState$$.next(false);
            this.cf.detectChanges();
          } else {
            this.toastrService.error("Произошла ошибка.");
          }
        },
        complete: () => {
          this.cf.detectChanges();
          this.utilsService.spinnerState$$.next(false);
        },
      });
    };

    fileReader.onerror = () => {
      this.uploadedImage = './assets/images/default-image.png';
    };
  }

  clearFile(): void {
    this.uploadedImage = ''
    this.isFile = false
    this.heightWithFile = '84px'
    this.fileInput.nativeElement.value = ''
  }

  sendFile(fileId: string) {
    this.chatSocket.emit('chatMessage', fileId, null, false, 'FILE')
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.previousMessageCount != this.chatMessages.length || this.isTyping) {
      this.msgContainer.nativeElement.scrollTop = this.msgContainer.nativeElement.scrollHeight;
      this.previousMessageCount = this.chatMessages.length;
    }
  }
  getFileIcon(fileType: string): string {
    const icons: { [key: string]: string } = {
      pdf: 'picture_as_pdf',
      doc: 'description',
      docx: 'description',
      xls: 'table_chart',
      xlsx: 'table_chart',
      zip: 'folder_zip',
      rar: 'folder_zip',
      mp4: 'movie',
      mp3: 'music_note',
      txt: 'text_snippet',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      bmp: 'image',
      webp: 'image',
      default: 'insert_drive_file',
    };
    return icons[fileType.toLowerCase()] || icons['default'];
  }

  isImageFile(fileUrl: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = this.getFileExtension(fileUrl);
    return imageExtensions.includes(extension.toLowerCase());
  }

  getFileExtension(fileUrl: string): string {
    const extension = fileUrl.split('.').pop();
    return extension ? extension.toLowerCase() : '';
  }

  getFileName(fileUrl: string): string {
    return fileUrl.split('/').pop() || 'Unknown File';
  }
  dateFormat(chat){
    try {
      const dateStr = chat?.created_at || ''
      if (!dateStr) return "";

      const date = new Date(dateStr);
      // const months = {
      //   ru: [
      //     "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
      //     "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
      //   ],
      //   en: [
      //     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      //     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      //   ],
      //   uz: [
      //     "Yan", "Fev", "Mar", "Apr", "May", "Iyun",
      //     "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"
      //   ],
      //   uz_cyrillic: [
      //     "Ян", "Фев", "Мар", "Апр", "Май", "Июн",
      //     "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
      //   ]
      // };
      let months: string[] = []
      if ( this.globalLang() ==='RUS'){
        months = [
          "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
          "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
        ]
      } else if ( this.globalLang() === 'ENG' ) {
        months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ]
      } else if ( this.globalLang() === 'UZB' ) {
        months = [
          "Yan", "Fev", "Mar", "Apr", "May", "Iyun",
          "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"
        ]
      } else if ( this.globalLang() === 'KRL' ) {
        months = [
          "Ян", "Фев", "Мар", "Апр", "Май", "Июн",
          "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
        ]
      }

      const month = months[date.getMonth()];
      const day = date.getDate();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${month} ${day}. ${hours}:${minutes}`;
    } catch (e) {
      return ""
    }

  }


}
