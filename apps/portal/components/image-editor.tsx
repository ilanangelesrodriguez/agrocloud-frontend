"use client";

import { useEffect, useRef, useState } from "react";
import { AlertDialog, Avatar, Button, toast } from "@heroui/react";
import { FiCamera, FiTrash2 } from "react-icons/fi";

export function ImageEditor({
  imageUrl,
  label,
  initials,
  maxBytes,
  canEdit = true,
  square = false,
  onSave,
  onRemove,
  onDirtyChange,
  onBusyChange,
}: {
  imageUrl?: string | null;
  label: string;
  initials: string;
  maxBytes: number;
  canEdit?: boolean;
  square?: boolean;
  onSave: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!file) {
      setPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    onDirtyChange?.(!!file);
  }, [file, onDirtyChange]);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  async function persist(remove = false) {
    if (busy || (!remove && !file)) return;
    setBusy(true);
    setRemoving(remove);
    setError("");
    try {
      if (remove) await onRemove();
      else await onSave(file!);
      setFile(null);
      setConfirm(false);
      toast.success(remove ? "Imagen eliminada" : "Imagen actualizada");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la imagen.");
    } finally {
      setBusy(false);
      setRemoving(false);
    }
  }
  return (
    <div className="space-y-3">
      <div className="group relative inline-flex">
        <Avatar
          className={
            "size-24 bg-accent/10 text-2xl text-accent sm:size-28 " + (square ? "rounded-2xl" : "")
          }
        >
          {(preview ?? imageUrl) ? (
            <Avatar.Image
              key={preview ?? imageUrl}
              src={preview ?? imageUrl ?? undefined}
              alt={label}
              className={
                (square ? "object-contain" : "object-cover") +
                " transition-opacity duration-150 motion-reduce:transition-none"
              }
            />
          ) : null}
          <Avatar.Fallback>{initials || "AC"}</Avatar.Fallback>
        </Avatar>
        {canEdit ? (
          <Button
            aria-label={"Editar " + label.toLowerCase()}
            isIconOnly
            size="sm"
            variant="secondary"
            isDisabled={busy}
            className="absolute -bottom-1 -right-1 rounded-full border border-border shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 motion-reduce:transition-none"
            onPress={() => input.current?.click()}
          >
            <FiCamera aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      {canEdit ? (
        <>
          <input
            ref={input}
            type="file"
            className="sr-only"
            tabIndex={-1}
            aria-label={"Seleccionar " + label.toLowerCase()}
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) => {
              const selected = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (!selected) return;
              if (
                !["image/jpeg", "image/png", "image/webp"].includes(selected.type) ||
                selected.size < 1 ||
                selected.size > maxBytes
              ) {
                setError("Selecciona JPG, PNG o WebP de hasta " + maxBytes / 1024 / 1024 + " MB.");
                return;
              }
              setError("");
              setFile(selected);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              isDisabled={busy}
              onPress={() => input.current?.click()}
            >
              {file ? "Elegir otra imagen" : "Cambiar imagen"}
            </Button>
            {imageUrl && !file ? (
              <Button
                size="sm"
                variant="tertiary"
                isDisabled={busy}
                onPress={() => setConfirm(true)}
              >
                <FiTrash2 aria-hidden="true" />
                Eliminar
              </Button>
            ) : null}
          </div>
          {file ? (
            <div className="space-y-2">
              <p className="break-all text-xs text-muted">
                Vista previa de {file.name}. Todavía no se ha guardado.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  isDisabled={busy}
                  onPress={() => void persist()}
                >
                  {busy ? "Guardando…" : "Guardar imagen"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  isDisabled={busy}
                  onPress={() => {
                    setFile(null);
                    setError("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : null}
          <p className="text-xs text-muted">JPG, PNG o WebP · Hasta {maxBytes / 1024 / 1024} MB</p>
          <AlertDialog
            isOpen={confirm}
            onOpenChange={(open) => {
              if (!busy) setConfirm(open);
            }}
          >
            <AlertDialog.Backdrop isDismissable={!busy} isKeyboardDismissDisabled={busy}>
              <AlertDialog.Container placement="center" size="sm">
                <AlertDialog.Dialog>
                  <AlertDialog.Header>
                    <AlertDialog.Icon status="danger" />
                    <AlertDialog.Heading>¿Eliminar la imagen?</AlertDialog.Heading>
                  </AlertDialog.Header>
                  <AlertDialog.Body>
                    Se quitará la imagen actual. Podrás subir una nueva cuando lo necesites.
                    {error ? (
                      <p className="mt-3 text-danger" role="alert">
                        {error}
                      </p>
                    ) : null}
                  </AlertDialog.Body>
                  <AlertDialog.Footer>
                    <Button slot="close" variant="secondary" isDisabled={busy}>
                      Cancelar
                    </Button>
                    <Button variant="danger" isDisabled={busy} onPress={() => void persist(true)}>
                      {removing ? "Eliminando…" : "Eliminar imagen"}
                    </Button>
                  </AlertDialog.Footer>
                </AlertDialog.Dialog>
              </AlertDialog.Container>
            </AlertDialog.Backdrop>
          </AlertDialog>
        </>
      ) : null}
      {error && !confirm ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
