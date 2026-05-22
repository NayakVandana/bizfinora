import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { phoneDigits } from '@/utils/indianPhone';
import { normalizeGst, normalizePan } from '@/utils/indianTaxId';
import type { CompanyProfileFormState } from './companyProfileForm';
import type { CompanyProfileFieldErrors } from './validateCompanyProfileForm';

type Props = {
    form: CompanyProfileFormState;
    errors?: CompanyProfileFieldErrors;
    onChange: (patch: Partial<CompanyProfileFormState>) => void;
    onClearError?: (key: keyof CompanyProfileFieldErrors) => void;
};

export default function CompanyProfileFormFields({
    form,
    errors = {},
    onChange,
    onClearError,
}: Props) {
    const onLogoFile = (file: File | null) => {
        if (!file) {
            onChange({ logo_data_url: null });
            return;
        }
        const reader = new FileReader();
        reader.onload = () =>
            onChange({ logo_data_url: reader.result as string });
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-5">
            <div>
                <InputLabel htmlFor="company_name" value="Company name *" />
                <TextInput
                    id="company_name"
                    className="mt-1.5 block w-full"
                    value={form.name}
                    onChange={(e) => {
                        onChange({ name: e.target.value });
                        onClearError?.('name');
                    }}
                    placeholder="e.g. Acme Trading Pvt Ltd"
                />
                <InputError message={errors.name} className="mt-1" />
            </div>

            <div>
                <InputLabel value="Address *" />
                <textarea
                    className="mt-1.5 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    value={form.address}
                    onChange={(e) => {
                        onChange({ address: e.target.value });
                        onClearError?.('address');
                    }}
                />
                <InputError message={errors.address} className="mt-1" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div>
                    <InputLabel value="City" />
                    <TextInput
                        className="mt-1.5 block w-full"
                        value={form.city}
                        onChange={(e) => onChange({ city: e.target.value })}
                    />
                    <InputError message={errors.city} className="mt-1" />
                </div>
                <div>
                    <InputLabel value="State" />
                    <TextInput
                        className="mt-1.5 block w-full"
                        value={form.state}
                        onChange={(e) => onChange({ state: e.target.value })}
                    />
                    <InputError message={errors.state} className="mt-1" />
                </div>
                <div>
                    <InputLabel value="Postal code" />
                    <TextInput
                        className="mt-1.5 block w-full"
                        value={form.postal_code}
                        onChange={(e) =>
                            onChange({ postal_code: e.target.value })
                        }
                    />
                    <InputError message={errors.postal_code} className="mt-1" />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <InputLabel value="GST" />
                    <TextInput
                        className="mt-1.5 block w-full uppercase"
                        value={form.gst}
                        maxLength={15}
                        placeholder="15-character GSTIN (optional)"
                        onChange={(e) => {
                            onChange({ gst: normalizeGst(e.target.value) });
                            onClearError?.('gst');
                        }}
                    />
                    <InputError message={errors.gst} className="mt-1" />
                </div>
                <div>
                    <InputLabel value="PAN" />
                    <TextInput
                        className="mt-1.5 block w-full uppercase"
                        value={form.pan}
                        maxLength={10}
                        placeholder="e.g. ABCDE1234F (optional)"
                        onChange={(e) => {
                            onChange({ pan: normalizePan(e.target.value) });
                            onClearError?.('pan');
                        }}
                    />
                    <InputError message={errors.pan} className="mt-1" />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <InputLabel value="Email *" />
                    <TextInput
                        type="email"
                        className="mt-1.5 block w-full"
                        value={form.email}
                        onChange={(e) => {
                            onChange({ email: e.target.value });
                            onClearError?.('email');
                        }}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>
                <div>
                    <InputLabel value="Phone *" />
                    <TextInput
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        className="mt-1.5 block w-full"
                        value={form.phone}
                        placeholder="10-digit mobile number"
                        onChange={(e) => {
                            onChange({
                                phone: phoneDigits(e.target.value).slice(
                                    0,
                                    10,
                                ),
                            });
                            onClearError?.('phone');
                        }}
                    />
                    <InputError message={errors.phone} className="mt-1" />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <InputLabel value="Bank account" />
                    <TextInput
                        className="mt-1.5 block w-full"
                        value={form.account_number}
                        onChange={(e) =>
                            onChange({ account_number: e.target.value })
                        }
                    />
                </div>
                <div>
                    <InputLabel value="SWIFT / BIC" />
                    <TextInput
                        className="mt-1.5 block w-full"
                        value={form.swift_bic}
                        onChange={(e) =>
                            onChange({ swift_bic: e.target.value })
                        }
                    />
                </div>
            </div>

            <div>
                <InputLabel value="Company notes" />
                <textarea
                    className="mt-1.5 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={2}
                    value={form.seller_notes}
                    onChange={(e) =>
                        onChange({ seller_notes: e.target.value })
                    }
                />
            </div>

            <div>
                <InputLabel value="Company logo" />
                <input
                    type="file"
                    accept="image/*"
                    className="mt-1.5 block w-full text-sm text-slate-600"
                    onChange={(e) =>
                        onLogoFile(e.target.files?.[0] ?? null)
                    }
                />
                {form.logo_data_url ? (
                    <img
                        src={form.logo_data_url}
                        alt="Company logo"
                        className="mt-2 h-16 object-contain"
                    />
                ) : null}
            </div>
        </div>
    );
}
