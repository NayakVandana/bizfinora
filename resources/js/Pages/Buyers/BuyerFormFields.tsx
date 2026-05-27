import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { phoneDigits } from '@/utils/indianPhone';
import { normalizeGst, normalizePan } from '@/utils/indianTaxId';
import type { BuyerFormState } from './buyerForm';
import type { BuyerFieldErrors } from './validateBuyerForm';

type Props = {
    form: BuyerFormState;
    errors?: BuyerFieldErrors;
    onChange: (patch: Partial<BuyerFormState>) => void;
};

export default function BuyerFormFields({ form, errors = {}, onChange }: Props) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
                <InputLabel value="Company name *" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.company_name}
                    onChange={(e) =>
                        onChange({ company_name: e.target.value })
                    }
                />
                <InputError message={errors.company_name} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
                <InputLabel value="Owner name *" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    placeholder="Contact person / proprietor"
                />
                <InputError message={errors.name} className="mt-1" />
            </div>
            <div>
                <InputLabel value="Mobile *" />
                <TextInput
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className="mt-1 block w-full"
                    value={form.phone}
                    onChange={(e) =>
                        onChange({
                            phone: phoneDigits(e.target.value).slice(0, 10),
                        })
                    }
                    placeholder="10-digit mobile number"
                />
                <InputError message={errors.phone} className="mt-1" />
            </div>
            <div>
                <InputLabel value="Email *" />
                <TextInput
                    type="email"
                    className="mt-1 block w-full"
                    value={form.email}
                    onChange={(e) => onChange({ email: e.target.value })}
                />
                <InputError message={errors.email} className="mt-1" />
            </div>
            <div>
                <InputLabel value="GST" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.gst}
                    maxLength={15}
                    onChange={(e) =>
                        onChange({ gst: normalizeGst(e.target.value) })
                    }
                    placeholder="15-character GSTIN (optional)"
                />
                <InputError message={errors.gst} className="mt-1" />
            </div>
            <div>
                <InputLabel value="PAN" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.pan}
                    maxLength={10}
                    onChange={(e) =>
                        onChange({ pan: normalizePan(e.target.value) })
                    }
                    placeholder="e.g. ABCDE1234F (optional)"
                />
                <InputError message={errors.pan} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
                <InputLabel value="Address *" />
                <textarea
                    className="app-field"
                    rows={3}
                    value={form.address}
                    onChange={(e) => onChange({ address: e.target.value })}
                    placeholder="Full address for invoices"
                />
                <InputError message={errors.address} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-0">
                    Structured address (optional)
                </p>
            </div>
            <div className="sm:col-span-2">
                <InputLabel value="Address line 1" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.address_line1}
                    onChange={(e) =>
                        onChange({ address_line1: e.target.value })
                    }
                    placeholder="Building, street"
                />
                <InputError message={errors.address_line1} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
                <InputLabel value="Address line 2" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.address_line2}
                    onChange={(e) =>
                        onChange({ address_line2: e.target.value })
                    }
                    placeholder="Area, landmark"
                />
                <InputError message={errors.address_line2} className="mt-1" />
            </div>
            <div>
                <InputLabel value="City *" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.city}
                    onChange={(e) => onChange({ city: e.target.value })}
                />
                <InputError message={errors.city} className="mt-1" />
            </div>
            <div>
                <InputLabel value="State *" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.state}
                    onChange={(e) => onChange({ state: e.target.value })}
                />
                <InputError message={errors.state} className="mt-1" />
            </div>
            <div>
                <InputLabel value="Postal code" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.postal_code}
                    onChange={(e) =>
                        onChange({ postal_code: e.target.value })
                    }
                    placeholder="Pin or ZIP"
                />
                <InputError message={errors.postal_code} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
                <InputLabel value="Notes" />
                <textarea
                    className="app-field"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => onChange({ notes: e.target.value })}
                    placeholder="Internal notes (optional)"
                />
                <InputError message={errors.notes} className="mt-1" />
            </div>
        </div>
    );
}
