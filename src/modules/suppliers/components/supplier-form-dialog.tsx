import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/form";
import { useSupplierForm } from "../hooks/use-supplier";
import {
  createSupplierSchema,
  type CreateSupplierFormData,
} from "../validation";
import type { Supplier } from "../types";
import FormTextField from "@/components/forms/form-textfield";
import DialogResponsive from "@/components/ui/dialog-responsive";

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
  onSuccess: () => void;
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: SupplierFormDialogProps) {
  const { t } = useTranslation();
  const { createSupplier, updateSupplier, loading, error } = useSupplierForm();

  const isEditing = !!supplier;

  const form = useForm<CreateSupplierFormData>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "Vietnam",
      contactPerson: "",
      taxNumber: "",
      bankAccount: "",
      bankName: "",
      paymentTerms: "",
      notes: "",
    },
  });

  // Reset form when dialog opens/closes or supplier changes
  useEffect(() => {
    if (open) {
      if (supplier) {
        form.reset({
          name: supplier.name,
          email: supplier.email || "",
          phone: supplier.phone,
          address: supplier.address,
          city: supplier.city,
          country: supplier.country,
          contactPerson: supplier.contactPerson || "",
          taxNumber: supplier.taxNumber || "",
          bankAccount: supplier.bankAccount || "",
          bankName: supplier.bankName || "",
          paymentTerms: supplier.paymentTerms || "",
          notes: supplier.notes || "",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          country: "Vietnam",
          contactPerson: "",
          taxNumber: "",
          bankAccount: "",
          bankName: "",
          paymentTerms: "",
          notes: "",
        });
      }
    }
  }, [open, supplier, form]);

  const onSubmit = async (data: CreateSupplierFormData) => {
    try {
      if (isEditing && supplier) {
        await updateSupplier(supplier.id, data);
      } else {
        await createSupplier(data);
      }
      onSuccess();
    } catch (error) {
      // Error is handled by the hook
      console.error("Error submitting supplier form:", error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const formContent = (
    <Form {...form}>
      <form
        id="supplier-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
          <FormTextField
            control={form.control}
            name="name"
            label={t("suppliers.name")}
            placeholder={t("suppliers.enterName")}
            required
          />

          <FormTextField
            control={form.control}
            name="contactPerson"
            label={t("suppliers.contactPerson")}
            placeholder={t("suppliers.enterContactPerson")}
          />

          <FormTextField
            control={form.control}
            name="email"
            label={t("suppliers.email")}
            placeholder={t("suppliers.enterEmail")}
          />

          <FormTextField
            control={form.control}
            name="phone"
            label={t("suppliers.phone")}
            placeholder={t("suppliers.enterPhone")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
          <FormTextField
            control={form.control}
            name="city"
            label={t("suppliers.city")}
            placeholder={t("suppliers.enterCity")}
          />

          <FormTextField
            control={form.control}
            name="country"
            label={t("suppliers.country")}
            placeholder={t("suppliers.enterCountry")}
          />
        </div>

        <FormTextField
          control={form.control}
          name="address"
          label={t("suppliers.address")}
          placeholder={t("suppliers.enterAddress")}
          type="textarea"
          rows={3}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
          <FormTextField
            control={form.control}
            name="taxNumber"
            label={t("suppliers.taxNumber")}
            placeholder={t("suppliers.enterTaxNumber")}
          />

          <FormTextField
            control={form.control}
            name="paymentTerms"
            label={t("suppliers.paymentTerms")}
            placeholder={t("suppliers.enterPaymentTerms")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormTextField
            control={form.control}
            name="bankName"
            label={t("suppliers.bankName")}
            placeholder={t("suppliers.enterBankName")}
          />

          <FormTextField
            control={form.control}
            name="bankAccount"
            label={t("suppliers.bankAccount")}
            placeholder={t("suppliers.enterBankAccount")}
          />
        </div>

        <FormTextField
          control={form.control}
          name="notes"
          label={t("suppliers.notes")}
          placeholder={t("suppliers.enterNotes")}
          type="textarea"
          rows={3}
        />

        {error && <div className="text-sm text-destructive">{error}</div>}
      </form>
    </Form>
  );

  return (
    <DialogResponsive
      open={open}
      onOpenChange={onOpenChange}
      title={
        isEditing ? t("suppliers.editSupplier") : t("suppliers.createSupplier")
      }
      description={
        isEditing
          ? t("suppliers.editSupplierDescription")
          : t("suppliers.createSupplierDescription")
      }
      actions={{
        cancel: {
          label: t("common.cancel"),
          onClick: handleClose,
          disabled: loading,
        },
        submit: {
          label: isEditing ? t("common.update") : t("common.create"),
          onClick: () => {},
          disabled: loading,
        },
      }}
      formId="supplier-form"
      className="max-w-3xl"
    >
      {formContent}
    </DialogResponsive>
  );
}
