"use client";

import { Calendar, DateField, DatePicker, FieldError, Label } from "@heroui/react";
import { parseDate, parseDateTime } from "@internationalized/date";

/** Conserva los valores ISO de los formularios sin usar el selector nativo del navegador. */
export function DateInput({
  name,
  label,
  initial,
  required,
  withTime = false,
  error,
  disabled,
}: {
  name: string;
  label: string;
  initial?: string | null;
  required?: boolean;
  withTime?: boolean;
  error?: string;
  disabled?: boolean;
}) {
  const value = initial
    ? withTime
      ? parseDateTime(initial.slice(0, 19))
      : parseDate(initial.slice(0, 10))
    : undefined;

  return (
    <DatePicker
      defaultValue={value}
      granularity={withTime ? "minute" : "day"}
      hourCycle={24}
      isDisabled={disabled}
      isInvalid={Boolean(error)}
      isRequired={required}
      name={name}
    >
      <Label>{label}</Label>
      <DateField.Group className="w-full">
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger aria-label={`Elegir ${label.toLowerCase()}`}>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label={label}>
          <Calendar.Header>
            <Calendar.Heading />
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
      </DatePicker.Popover>
      {error ? <FieldError>{error}</FieldError> : null}
    </DatePicker>
  );
}
