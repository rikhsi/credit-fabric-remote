import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AmountService {

  numberToWordsRU(amount: number) {
    const units = [
      "", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"
    ];
    const unitsFemale = [
      "", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"
    ];
    const teens = [
      "десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать",
      "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"
    ];
    const tens = [
      "", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят",
      "семьдесят", "восемьдесят", "девяносто"
    ];
    const hundreds = [
      "", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот",
      "семьсот", "восемьсот", "девятьсот"
    ];
    const thousands = [
      ["", "", ""],
      ["тысяча", "тысячи", "тысяч"],
      ["миллион", "миллиона", "миллионов"],
      ["миллиард", "миллиарда", "миллиардов"]
    ];

    function declension(number: number, forms: any) {
      const n = Math.abs(number) % 100;
      if (n > 10 && n < 20) return forms[2];
      const n1 = n % 10;
      if(n1 === 0 && forms[0] === 'тийин') return forms[0]
      if (n1 === 1) return forms[0];
      if (n1 >= 2 && n1 <= 4) return forms[1];
      return forms[2];
    }

    function convertChunk(chunk: number, isFemale = false) {
      let chunkInWords = "";
      chunkInWords += hundreds[Math.floor(chunk / 100)] + " ";
      chunk %= 100;

      if (chunk >= 10 && chunk < 20) {
        chunkInWords += teens[chunk - 10] + " ";
        return chunkInWords.trim();
      } else {
        chunkInWords += tens[Math.floor(chunk / 10)] + " ";
        chunk %= 10;
      }

      const unitArray = isFemale ? unitsFemale : units;
      chunkInWords += unitArray[chunk] + " ";

      return chunkInWords.trim();
    }

    function splitIntoChunks(number: number) {
      const chunks: number[] = [];
      while (number > 0) {
        chunks.push(number % 1000);
        number = Math.floor(number / 1000);
      }
      return chunks;
    }

    if (amount === 0) return "ноль сум";

    const [integerPart, decimalPart] = amount?.toFixed(2).split(".");

    let words = "";
    const chunks = splitIntoChunks(parseInt(integerPart, 10));

    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i] > 0 || i === 0) {
        const isFemale = i === 1;

        words =
          convertChunk(chunks[i], isFemale) +
          (i > 0 ? " " + declension(chunks[i], thousands[i]) : "") +
          " " +
          words;
      }
    }

    words = words.trim() + " сум";

    const tiyins = parseInt(decimalPart || '0', 10);
    words += ' ' + tiyins.toString().padStart(2, '0') + ' ' + declension(tiyins, ["тийин", "тийина", "тийинов"]);;

    const res = words.trim();

    if(res) {
      return res.charAt(0).toUpperCase() + res.slice(1);
    } else {
      return '';
    }
  }

  separateNumberByThree(value: string | number): string {
    if(!value) {
      return '0';
    }
    const strValue = value.toString();

    return strValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  convertToAmount(value: number) {
    if(!value) {
      return '0,00';
    }

    const isNegative = value < 0;
    const absValue = Math.abs(value);

    const integer = this.separateNumberByThree(Math.floor(absValue / 100));
    const decimal = `${absValue % 100}`.padStart(2, '0');
    return `${isNegative ? '-' : ''}${integer},${decimal}`;
  }
}
