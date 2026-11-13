"use client";

import { useState } from "react";
import {
  Autocomplete,
  Button,
  Checkbox,
  CheckboxGroup,
  ComboBox,
  Description,
  ErrorMessage,
  FieldError,
  Fieldset,
  Form,
  Input,
  InputGroup,
  Label,
  ListBox,
  Radio,
  RadioGroup,
  SearchField,
  Separator,
  Surface,
  Switch,
  TextField,
  toast,
} from "@heroui/react";

import { DemoLabel, DemoSection } from "./demo-section";

const producers = [
  { id: "p1", name: "Fundo Los Olivos" },
  { id: "p2", name: "Agro Norte" },
  { id: "p3", name: "Valle Verde" },
];

export function FormsDemo() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [checked, setChecked] = useState<string[]>(["traceability"]);
  const [mode, setMode] = useState("manual");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const invalidEmail = submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <DemoSection
      description="Form · Fieldset · FieldError · ErrorMessage · Input · InputGroup · Autocomplete · ComboBox · Checkbox · CheckboxGroup · RadioGroup · Switch"
      title="Formularios y selección"
    >
      <div className="grid gap-3">
        <DemoLabel>Form, Fieldset, Input y FieldError</DemoLabel>
        <Form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              toast.success("Formulario validado", {
                description: "Demostración: no se envió información a ningún servidor.",
              });
            }
          }}
        >
          <Fieldset className="rounded-xl border border-border p-4">
            <Fieldset.Legend>Datos del solicitante (demostración)</Fieldset.Legend>
            <Fieldset.Group className="grid gap-4 pt-3 sm:grid-cols-2">
              <TextField name="razon_social">
                <Label>Razón social</Label>
                <Input placeholder="Empresa Agroindustrial S.A.C." />
              </TextField>
              <TextField isInvalid={invalidEmail} name="correo">
                <Label>Correo empresarial</Label>
                <Input
                  placeholder="contacto@empresa.pe"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <FieldError>Ingresa un correo empresarial válido.</FieldError>
              </TextField>
              <TextField name="peso">
                <Label>Peso recibido</Label>
                <InputGroup>
                  <InputGroup.Prefix>kg</InputGroup.Prefix>
                  <InputGroup.Input inputMode="decimal" placeholder="1250.50" />
                </InputGroup>
                <Description>Solo una representación visual; no registra pesos.</Description>
              </TextField>
            </Fieldset.Group>
            <Fieldset.Actions>
              <Button type="submit" variant="primary">
                Validar formulario
              </Button>
              <Button
                type="reset"
                variant="secondary"
                onPress={() => {
                  setEmail("");
                  setSubmitted(false);
                }}
              >
                Limpiar
              </Button>
            </Fieldset.Actions>
          </Fieldset>
        </Form>
        <Surface className="rounded-lg border border-border px-3 py-2">
          <ErrorMessage>
            Ejemplo de ErrorMessage: para errores de componentes no asociados a un campo de
            formulario.
          </ErrorMessage>
        </Surface>
      </div>

      <Separator />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <DemoLabel>Autocomplete</DemoLabel>
          <Autocomplete className="w-full">
            <Label>Filtrar productores</Label>
            <Autocomplete.Trigger>
              <Autocomplete.Value />
              <Autocomplete.ClearButton />
              <Autocomplete.Indicator />
            </Autocomplete.Trigger>
            <Autocomplete.Popover>
              <Autocomplete.Filter>
                <SearchField aria-label="Buscar productor">
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Buscar..." />
                  </SearchField.Group>
                </SearchField>
                <ListBox>
                  {producers.map((producer) => (
                    <ListBox.Item key={producer.id} id={producer.id} textValue={producer.name}>
                      <Label>{producer.name}</Label>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Autocomplete.Filter>
            </Autocomplete.Popover>
          </Autocomplete>
        </div>
        <div className="min-w-0 space-y-2">
          <DemoLabel>ComboBox</DemoLabel>
          <ComboBox className="w-full">
            <Label>Productor por texto</Label>
            <ComboBox.InputGroup>
              <Input placeholder="Escribe para filtrar" />
              <ComboBox.Trigger />
            </ComboBox.InputGroup>
            <ComboBox.Popover>
              <ListBox>
                {producers.map((producer) => (
                  <ListBox.Item key={producer.id} id={producer.id} textValue={producer.name}>
                    <Label>{producer.name}</Label>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </ComboBox.Popover>
          </ComboBox>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid content-start gap-3">
          <DemoLabel>CheckboxGroup y Checkbox</DemoLabel>
          <CheckboxGroup name="permissions" value={checked} onChange={setChecked}>
            <Label>Módulos habilitados (ejemplo)</Label>
            <Checkbox value="traceability">
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                Trazabilidad
              </Checkbox.Content>
            </Checkbox>
            <Checkbox value="reports">
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                Reportes
              </Checkbox.Content>
            </Checkbox>
            <Checkbox value="ai">
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                Inspecciones con IA
              </Checkbox.Content>
            </Checkbox>
          </CheckboxGroup>
          <p className="text-xs text-muted">Seleccionados: {checked.length}</p>
        </div>

        <div className="grid content-start gap-5">
          <div className="grid gap-2">
            <DemoLabel>RadioGroup</DemoLabel>
            <RadioGroup value={mode} onChange={setMode}>
              <Label>Modo de inspección</Label>
              <Radio value="manual">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  Manual
                </Radio.Content>
              </Radio>
              <Radio value="assisted">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  Asistida por IA
                </Radio.Content>
              </Radio>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <DemoLabel>Switch</DemoLabel>
            <Switch isSelected={emailAlerts} onChange={setEmailAlerts}>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Content>
                <Label>Alertas por correo</Label>
                <Description>Control visual local, sin conexión a preferencias reales.</Description>
              </Switch.Content>
            </Switch>
          </div>
        </div>
      </div>
    </DemoSection>
  );
}
