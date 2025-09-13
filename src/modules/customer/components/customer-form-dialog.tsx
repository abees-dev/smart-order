import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/form";
import { useCustomerActions } from "../hooks/use-customer";
import {
  createCustomerSchema,
  type CreateCustomerFormData,
} from "../validation";
import type { Customer } from "../types";
import FormTextField from "@/components/forms/form-textfield";
import DialogResponsive from "@/components/ui/dialog-responsive";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSuccess: () => void;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerFormDialogProps) {
  const { t } = useTranslation();
  const { createCustomer, updateCustomer, loading, error } =
    useCustomerActions();

  const isEditing = !!customer;

  const form = useForm<CreateCustomerFormData>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "Vietnam",
      contactPerson: "",
      notes: "",
      customerCode: "",
      taxCode: "",
    },
  });

  // Reset form when dialog opens/closes or customer changes
  useEffect(() => {
    if (open) {
      if (customer) {
        form.reset({
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          country: customer.country,
          contactPerson: customer.contactPerson || "",
          notes: customer.notes || "",
          customerCode: customer.customerCode || "",
          taxCode: customer.taxCode || "",
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
          notes: "",
          customerCode: "",
          taxCode: "",
        });
      }
    }
  }, [open, customer, form]);

  const onSubmit = async (data: CreateCustomerFormData) => {
    try {
      // Convert empty strings to undefined for optional fields
      const cleanedData = {
        ...data,
        email: data.email?.trim() || undefined,
        contactPerson: data.contactPerson?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
      };

      if (isEditing && customer) {
        await updateCustomer(customer.id, cleanedData);
      } else {
        await createCustomer(cleanedData);
      }
      onSuccess();
    } catch (error) {
      // Error is handled by the hook
      console.error("Form submission error:", error);
    }
  };

  const formContent = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6"
        noValidate
        id="customer-form"
      >
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <FormTextField
            control={form.control}
            name="customerCode"
            label={t("customers.customerCode")}
            placeholder={t("customers.customerCodePlaceholder")}
          />
          <FormTextField
            control={form.control}
            name="name"
            label={t("customers.customerName")}
            placeholder={t("customers.customerNamePlaceholder")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <FormTextField
            control={form.control}
            name="email"
            label={t("customers.email")}
            placeholder={t("customers.emailPlaceholder")}
          />
          <FormTextField
            control={form.control}
            name="phone"
            placeholder={t("customers.phonePlaceholder")}
            label={t("customers.phone")}
          />
        </div>

        <FormTextField
          control={form.control}
          name="address"
          placeholder={t("customers.addressPlaceholder")}
          label={t("customers.address")}
          type="area"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <FormTextField
            control={form.control}
            name="city"
            placeholder={t("customers.cityPlaceholder")}
            label={t("customers.city")}
          />

          <FormTextField
            control={form.control}
            name="contactPerson"
            placeholder={t("customers.contactPersonPlaceholder")}
            label={t("customers.contactPerson")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <FormTextField
            control={form.control}
            name="country"
            placeholder={t("customers.countryPlaceholder")}
            label={t("customers.country")}
          />
          <FormTextField
            control={form.control}
            name="taxCode"
            placeholder={t("customers.taxCodePlaceholder")}
            label={t("customers.taxCode")}
          />
        </div>

        <FormTextField
          control={form.control}
          name="notes"
          placeholder={t("customers.notesPlaceholder")}
          label={t("customers.notes")}
        />
      </form>
    </Form>
  );

  return (
    <DialogResponsive
      open={open}
      onOpenChange={onOpenChange}
      title={
        isEditing ? t("customers.editCustomer") : t("customers.addCustomer")
      }
      description={
        isEditing
          ? t("customers.editCustomerDescription")
          : t("customers.addCustomerDescription")
      }
      className="sm:max-w-[600px]"
      actions={{
        cancel: {
          label: t("common.cancel"),
          onClick: () => onOpenChange(false),
          disabled: loading,
        },
        submit: {
          label: isEditing ? t("common.update") : t("common.create"),
          onClick: () => form.handleSubmit(onSubmit)(),
          disabled: loading,
        },
      }}
      formId="customer-form"
    >
      {formContent}
    </DialogResponsive>
  );
}
