"use client";

import { DateField, DateRangePicker, FieldError, Label, RangeCalendar } from "@heroui/react";
import { parseDate } from "@internationalized/date";

/** Fechas de calendario YYYY-MM-DD; no convierte el intervalo a la zona horaria local. */
export function DateRangeInput({
  initialFrom,
  initialTo,
  disabled,
  error,
  onChange,
  onRangeChange,
}: {
  initialFrom?: string;
  initialTo?: string;
  disabled?: boolean;
  error?: string;
  onChange?: () => void;
  onRangeChange?: (range: { from?: string; to?: string }) => void;
}) {
  return (
    <DateRangePicker
      startName="from"
      endName="to"
      isDisabled={disabled}
      isInvalid={error ? true : undefined}
      onChange={(range) => {
        onChange?.();
        onRangeChange?.({ from: range?.start.toString(), to: range?.end.toString() });
      }}
      defaultValue={
        initialFrom && initialTo
          ? { start: parseDate(initialFrom), end: parseDate(initialTo) }
          : undefined
      }
    >
      <Label>Periodo del reporte (UTC)</Label>
      <DateField.Group variant="secondary" className="w-full">
        <DateField.InputContainer>
          <DateField.Input slot="start" aria-label="Desde">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateRangePicker.RangeSeparator />
          <DateField.Input slot="end" aria-label="Hasta">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
        </DateField.InputContainer>
        <DateField.Suffix>
          <DateRangePicker.Trigger aria-label="Elegir periodo">
            <DateRangePicker.TriggerIndicator />
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DateRangePicker.Popover>
        <RangeCalendar aria-label="Periodo del reporte">
          <RangeCalendar.Header>
            <RangeCalendar.Heading />
            <RangeCalendar.NavButton slot="previous" />
            <RangeCalendar.NavButton slot="next" />
          </RangeCalendar.Header>
          <RangeCalendar.Grid>
            <RangeCalendar.GridHeader>
              {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>
              {(date) => <RangeCalendar.Cell date={date} />}
            </RangeCalendar.GridBody>
          </RangeCalendar.Grid>
        </RangeCalendar>
      </DateRangePicker.Popover>
      <FieldError>{error}</FieldError>
    </DateRangePicker>
  );
}
