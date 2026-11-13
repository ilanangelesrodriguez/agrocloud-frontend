"use client";

import { Calendar, RangeCalendar, Separator } from "@heroui/react";

import { DemoLabel, DemoSection } from "./demo-section";

export function DatesDemo() {
  return (
    <DemoSection
      description="Calendar · RangeCalendar · navegación por mes y teclado"
      title="Selección de fechas"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <DemoLabel>Calendar · fecha de inspección</DemoLabel>
          <Calendar aria-label="Fecha de inspección de demostración">
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
        </div>
        <div className="min-w-0 space-y-3">
          <DemoLabel>RangeCalendar · período de reportes</DemoLabel>
          <RangeCalendar aria-label="Rango de fechas para reportes de demostración">
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
        </div>
      </div>
      <Separator />
      <p className="text-xs text-muted">
        Esta biblioteca muestra los calendarios directamente. Para filtros de tablas reales,
        conviene exponerlos mediante DatePicker o DateRangePicker y conservar los filtros en la URL.
      </p>
    </DemoSection>
  );
}
