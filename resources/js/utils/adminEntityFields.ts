import type { AdminDetailField } from '@/utils/adminDetailFormat';
import {
    adminBoolField,
    adminDateField,
    adminTextField,
} from '@/Components/admin/AdminDetailPanel';
import type {
    AdminCompanyDetail,
    AdminUserCompany,
    AdminUserDetail,
} from '@/types/admin';

export function userAccountFields(user: AdminUserDetail): AdminDetailField[] {
    return [
        adminTextField('ID', user.id),
        adminTextField('Name', user.name),
        adminTextField('Email', user.email),
        adminTextField('Role', user.is_admin ? 'Admin' : 'User'),
        adminTextField('Current company ID', user.current_company_id),
        adminDateField('Email verified', user.email_verified_at),
        adminDateField('Joined', user.created_at),
        adminTextField('Companies', user.companies_count ?? user.companies.length),
    ];
}

export function userAddressFields(user: AdminUserDetail): AdminDetailField[] {
    return [
        adminTextField('Address', user.address, { multiline: true, fullWidth: true }),
        adminTextField('City', user.city),
        adminTextField('State', user.state),
        adminTextField('Postal code', user.postal_code),
    ];
}

export function companyOverviewFields(
    company: AdminCompanyDetail,
): AdminDetailField[] {
    return [
        adminTextField('ID', company.id),
        adminTextField('Name', company.name),
        adminTextField('Slug', company.slug),
        adminTextField('Email', company.email),
        adminTextField('Phone', company.phone),
        adminTextField('Members', company.users_count ?? company.users.length),
        adminTextField('Buyers', company.buyers_count ?? company.buyers.length),
        adminDateField('Created', company.created_at),
        adminDateField('Updated', company.updated_at),
    ];
}

export function companyAddressFields(
    company: AdminCompanyDetail,
): AdminDetailField[] {
    return [
        adminTextField('Address', company.address, {
            multiline: true,
            fullWidth: true,
        }),
        adminTextField('City', company.city),
        adminTextField('State', company.state),
        adminTextField('Postal code', company.postal_code),
    ];
}

export function companyTaxFields(
    company: AdminCompanyDetail,
): AdminDetailField[] {
    return [
        adminTextField('Tax ID label', company.tax_id_label),
        adminTextField('Tax ID', company.tax_id),
        adminTextField('GSTIN', company.gst),
        adminTextField('PAN', company.pan),
        adminTextField('Default tax type', company.default_tax_type),
        adminTextField('Default tax label', company.default_tax_label),
        adminTextField('Default tax rate', company.default_tax_rate),
        adminTextField('Tax calculation', company.tax_calculation_mode),
        adminBoolField('Tax per line', company.tax_per_line),
    ];
}

export function companyPaymentFields(
    company: AdminCompanyDetail,
): AdminDetailField[] {
    return [
        adminTextField('Account holder', company.account_holder),
        adminTextField('Account type', company.account_type),
        adminTextField('Account number', company.account_number),
        adminTextField('UPI ID', company.upi_id),
        adminTextField('Branch IFSC', company.branch_ifsc),
        adminTextField('Branch name', company.branch_name),
        adminTextField('SWIFT / BIC', company.swift_bic),
        adminTextField('Payment note', company.payment_note, {
            multiline: true,
            fullWidth: true,
        }),
        adminTextField('Default payment terms', company.default_payment_terms, {
            multiline: true,
            fullWidth: true,
        }),
        adminBoolField('Show payment on invoice', company.default_show_payment_on_invoice),
        adminBoolField('Show bank details', company.default_show_bank_details_on_invoice),
        adminBoolField('Show QR on invoice', company.default_show_qr_on_invoice),
        adminBoolField('Show payment terms', company.default_show_payment_terms_on_invoice),
    ];
}

export function companyTermsFields(
    company: AdminCompanyDetail,
): AdminDetailField[] {
    return [
        adminTextField(
            'Default terms & conditions',
            company.default_terms_and_conditions,
            { multiline: true, fullWidth: true },
        ),
        adminBoolField('Show terms on invoice', company.default_show_terms_on_invoice),
        adminBoolField(
            'Show authorised signature',
            company.default_show_authorized_signature_on_invoice,
        ),
    ];
}

export function companyInvoiceFields(
    company: AdminCompanyDetail,
): AdminDetailField[] {
    return [
        adminTextField('Default template', company.default_invoice_template),
        adminTextField('Default invoice type', company.default_invoice_type),
        adminTextField(
            'Default custom template ID',
            company.default_custom_template_id,
        ),
        adminTextField('Seller notes', company.seller_notes, {
            multiline: true,
            fullWidth: true,
        }),
    ];
}

export function companyMembershipFields(
    company: AdminUserCompany,
): AdminDetailField[] {
    return [
        adminTextField('ID', company.id),
        adminTextField('Name', company.name),
        adminTextField('Slug', company.slug),
        adminTextField('Role', company.role),
        adminBoolField('Current company', company.is_current),
        adminDateField('Created', company.created_at),
        adminDateField('Updated', company.updated_at),
    ];
}

export function companyFullProfileFields(
    company: AdminUserDetail['companies'][number],
): AdminDetailField[] {
    return [
        ...companyMembershipFields(company),
        adminTextField('Email', company.email),
        adminTextField('Phone', company.phone),
        adminTextField('Address', company.address, {
            multiline: true,
            fullWidth: true,
        }),
        adminTextField('City', company.city),
        adminTextField('State', company.state),
        adminTextField('Postal code', company.postal_code),
        adminTextField('Tax ID label', company.tax_id_label),
        adminTextField('Tax ID', company.tax_id),
        adminTextField('GSTIN', company.gst),
        adminTextField('PAN', company.pan),
        adminTextField('Account holder', company.account_holder),
        adminTextField('Account type', company.account_type),
        adminTextField('Account number', company.account_number),
        adminTextField('UPI ID', company.upi_id),
        adminTextField('Branch IFSC', company.branch_ifsc),
        adminTextField('Branch name', company.branch_name),
        adminTextField('SWIFT / BIC', company.swift_bic),
        adminTextField('Payment note', company.payment_note, {
            multiline: true,
            fullWidth: true,
        }),
        adminTextField('Default payment terms', company.default_payment_terms, {
            multiline: true,
            fullWidth: true,
        }),
        adminTextField(
            'Default terms & conditions',
            company.default_terms_and_conditions,
            { multiline: true, fullWidth: true },
        ),
        adminBoolField('Show terms on invoice', company.default_show_terms_on_invoice),
        adminBoolField(
            'Show authorised signature',
            company.default_show_authorized_signature_on_invoice,
        ),
        adminBoolField('Show payment on invoice', company.default_show_payment_on_invoice),
        adminBoolField('Show bank details', company.default_show_bank_details_on_invoice),
        adminBoolField('Show QR on invoice', company.default_show_qr_on_invoice),
        adminBoolField('Show payment terms', company.default_show_payment_terms_on_invoice),
        adminTextField('Default tax type', company.default_tax_type),
        adminTextField('Default tax label', company.default_tax_label),
        adminTextField('Default tax rate', company.default_tax_rate),
        adminTextField('Tax calculation', company.tax_calculation_mode),
        adminBoolField('Tax per line', company.tax_per_line),
        adminTextField('Default template', company.default_invoice_template),
        adminTextField('Default invoice type', company.default_invoice_type),
        adminTextField(
            'Default custom template ID',
            company.default_custom_template_id,
        ),
        adminTextField('Seller notes', company.seller_notes, {
            multiline: true,
            fullWidth: true,
        }),
    ];
}
