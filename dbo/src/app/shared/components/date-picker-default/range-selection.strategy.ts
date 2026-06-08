
import { Injectable } from '@angular/core';
import { DateRange, MatDateRangeSelectionStrategy } from '@angular/material/datepicker';

@Injectable()
export class PreviewRangeSelectionStrategy implements MatDateRangeSelectionStrategy<Date> {
  onSelectionChanged?: (start: Date | null, end: Date | null) => void;

  selectionFinished(date: Date, currentRange: DateRange<Date>): DateRange<Date> {
    let { start, end } = currentRange;
    if (start == null || (start != null && end != null)) {
      start = date;
      end = null;
    } else if (end == null) {
      end = date;
    }
    this.onSelectionChanged?.(start, end);
    return new DateRange<Date>(start, end);
  }

  createPreview(activeDate: Date | null, currentRange: DateRange<Date>): DateRange<Date> {
    if (currentRange.start && !currentRange.end) {
      const rangeEnd = activeDate && activeDate >= currentRange.start ? activeDate : currentRange.start;
      return new DateRange<Date>(currentRange.start, rangeEnd);
    }
    return new DateRange<Date>(null, null);
  }
}