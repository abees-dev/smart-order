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
import { useSupplierForm } from "../hooks/use-supplier";
import {
  createSupplierSchema,
  type CreateSupplierFormData,
} from "../validation";
import type { Supplier } from "../types";

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
  const isMobile = useIsMobile();

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("suppliers.enterName")} {...field} />
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
                <FormLabel>{t("suppliers.contactPerson")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("suppliers.enterContactPerson")}
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
                <FormLabel>{t("suppliers.email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("suppliers.enterEmail")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.phone")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("suppliers.enterPhone")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.city")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("suppliers.enterCity")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.country")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("suppliers.enterCountry")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("suppliers.address")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("suppliers.enterAddress")}
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
          <FormField
            control={form.control}
            name="taxNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.taxNumber")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("suppliers.enterTaxNumber")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentTerms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.paymentTerms")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("suppliers.enterPaymentTerms")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.bankName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("suppliers.enterBankName")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankAccount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.bankAccount")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("suppliers.enterBankAccount")}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("suppliers.notes")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("suppliers.enterNotes")}
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
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
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {isEditing
                ? t("suppliers.editSupplier")
                : t("suppliers.createSupplier")}
            </DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? t("suppliers.editSupplierDescription")
                : t("suppliers.createSupplierDescription")}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">{formContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("suppliers.editSupplier")
              : t("suppliers.createSupplier")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("suppliers.editSupplierDescription")
              : t("suppliers.createSupplierDescription")}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
