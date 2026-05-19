export interface NativeEvent<T> {
  event: string;
  data: NativeEventData<T>;
}

export interface NativeEventData<T> {
  event_name: string;
  status: string;
  data: T;
}
