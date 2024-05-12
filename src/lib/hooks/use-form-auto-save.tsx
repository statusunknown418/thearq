import { useCallback, useEffect, useRef } from "react";
import { type FieldValues, type UseFormReturn } from "react-hook-form";

export const useFormAutoSave = <FormParams extends FieldValues>({
  form,
  debounce = 300,
  onSubmit,
}: {
  form: UseFormReturn<FormParams>;
  debounce?: number;
  onSubmit: (...args: unknown[]) => void;
}) => {
  const saveToBackend = useCallback(
    (data: FormParams) => {
      void form.handleSubmit(() => onSubmit(data))();
    },
    [form, onSubmit],
  );

  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const watcher = form.watch((data) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      timeout.current = setTimeout(() => {
        saveToBackend(data as unknown as FormParams);
      }, debounce);
    });

    return () => watcher.unsubscribe();
  }, [debounce, form, saveToBackend]);
};
