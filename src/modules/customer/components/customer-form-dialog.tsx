import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCustomerActions } from "../hooks/use-customer";
import {
  createCustomerSchema,
  type CreateCustomerFormData,
} from "../validation";
import type { Customer } from "../types";

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
  const isMobile = useIsMobile();

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
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("customers.customerName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("customers.customerNamePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("customers.email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("customers.emailPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("customers.phone")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("customers.phonePlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("customers.address")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("customers.addressPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("customers.city")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("customers.cityPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("customers.contactPerson")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("customers.contactPersonPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("customers.country")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("customers.countryPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("customers.notes")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("customers.notesPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading
              ? t("common.loading")
              : isEditing
              ? t("common.update")
              : t("common.create")}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>
              {isEditing
                ? t("customers.editCustomer")
                : t("customers.addCustomer")}
            </DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? t("customers.editCustomerDescription")
                : t("customers.addCustomerDescription")}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">{formContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("customers.editCustomer")
              : t("customers.addCustomer")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("customers.editCustomerDescription")
              : t("customers.addCustomerDescription")}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
