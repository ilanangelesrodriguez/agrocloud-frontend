"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label, ListBox, Select } from "@heroui/react";
import { bffRequest } from "@/lib/api/bff-client";
import { z } from "zod";

const optionsSchema = z.object({ data: z.array(z.object({ code: z.string(), name: z.string() })) });
type Location = { departamento?: string | null; provincia?: string | null; distrito?: string | null; ubigeo?: string | null };

function usePlaces(level: "departamento" | "provincia" | "distrito", parent: string) {
  return useQuery({
    queryKey: ["geo", level, parent],
    queryFn: ({ signal }) =>
      bffRequest(`geo?level=${level}${parent ? "&parent=" + parent : ""}`, optionsSchema, { signal }, "agricultural"),
    enabled: level === "departamento" || Boolean(parent),
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
}

/** Three controlled HeroUI selects; backend revalidates and normalizes all fields. */
export function LocationFields({ initial, disabled }: { initial?: Location; disabled?: boolean }) {
  const initialCode = /^\d{6}$/.test(initial?.ubigeo ?? "") ? initial!.ubigeo! : "";
  const [departmentCode, setDepartmentCode] = useState(initialCode.slice(0, 2));
  const [provinceCode, setProvinceCode] = useState(initialCode.slice(0, 4));
  const [districtCode, setDistrictCode] = useState(initialCode);
  const departments = usePlaces("departamento", "");
  const provinces = usePlaces("provincia", departmentCode);
  const districts = usePlaces("distrito", provinceCode);
  const department = departments.data?.data.find((x) => x.code === departmentCode);
  const province = provinces.data?.data.find((x) => x.code === provinceCode);
  const district = districts.data?.data.find((x) => x.code === districtCode);
  const incomplete = Boolean(initialCode && (!department || !province || !district));
  const disabledByLoad = departments.isPending || departments.isError;

  return (
    <section className="space-y-3 sm:col-span-2" aria-label="Ubicación geográfica">
      <p className="text-sm font-semibold">Ubicación geográfica (UBIGEO)</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select isDisabled={disabled || disabledByLoad} value={departmentCode || null}
          placeholder="Selecciona departamento"
          onChange={(value) => { setDepartmentCode(String(value ?? "")); setProvinceCode(""); setDistrictCode(""); }}>
          <Label>Departamento</Label>
          <Select.Trigger className="min-h-11 w-full"><Select.Value /><Select.Indicator /></Select.Trigger>
          <Select.Popover><ListBox aria-label="Departamentos del Perú">
            {(departments.data?.data ?? []).map((item) => (
              <ListBox.Item key={item.code} id={item.code} textValue={item.name}>{item.name}</ListBox.Item>
            ))}
          </ListBox></Select.Popover>
        </Select>
        <Select isDisabled={disabled || !departmentCode || provinces.isPending || provinces.isError}
          value={provinceCode || null} placeholder="Selecciona provincia"
          onChange={(value) => { setProvinceCode(String(value ?? "")); setDistrictCode(""); }}>
          <Label>Provincia</Label>
          <Select.Trigger className="min-h-11 w-full"><Select.Value /><Select.Indicator /></Select.Trigger>
          <Select.Popover><ListBox aria-label="Provincias del departamento">
            {(provinces.data?.data ?? []).map((item) => (
              <ListBox.Item key={item.code} id={item.code} textValue={item.name}>{item.name}</ListBox.Item>
            ))}
          </ListBox></Select.Popover>
        </Select>
        <Select isDisabled={disabled || !provinceCode || districts.isPending || districts.isError}
          value={districtCode || null} placeholder="Selecciona distrito" onChange={(value) => setDistrictCode(String(value ?? ""))}>
          <Label>Distrito</Label>
          <Select.Trigger className="min-h-11 w-full"><Select.Value /><Select.Indicator /></Select.Trigger>
          <Select.Popover><ListBox aria-label="Distritos de la provincia">
            {(districts.data?.data ?? []).map((item) => (
              <ListBox.Item key={item.code} id={item.code} textValue={item.name}>{item.name} · {item.code}</ListBox.Item>
            ))}
          </ListBox></Select.Popover>
        </Select>
      </div>
      <input type="hidden" name="departamento" value={department?.name ?? (incomplete ? initial?.departamento ?? "" : "")} />
      <input type="hidden" name="provincia" value={province?.name ?? (incomplete ? initial?.provincia ?? "" : "")} />
      <input type="hidden" name="distrito" value={district?.name ?? (incomplete ? initial?.distrito ?? "" : "")} />
      <input type="hidden" name="ubigeo" value={district?.code ?? (incomplete ? initialCode : "")} />
      <p className="text-xs text-muted" role="status">
        {departments.isError || provinces.isError || districts.isError
          ? "No se pudo consultar el catálogo UBIGEO. Reintenta antes de guardar."
          : district ? `Código UBIGEO: ${district.code}` : "Selecciona departamento, provincia y distrito. El UBIGEO se completa solo."}
      </p>
      {incomplete && !departments.isPending && !provinces.isPending && !districts.isPending ? (
        <p className="text-xs text-warning">Revisa la ubicación previamente registrada antes de guardar.</p>
      ) : null}
    </section>
  );
}
