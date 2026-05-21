import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { phoneDigits } from '@/utils/indianPhone';
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
            <div>
                <InputLabel value="Name *" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                />
                <InputError message={errors.name} className="mt-1" />
            </div>
            <div>
                <InputLabel value="Email" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.email ?? ''}
                    onChange={(e) => onChange({ email: e.target.value })}
                />
            </div>
            <div>
                <InputLabel value="Phone" />
                <TextInput
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className="mt-1 block w-full"
                    value={form.phone ?? ''}
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
                <InputLabel value="Tax ID" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.tax_id ?? ''}
                    onChange={(e) => onChange({ tax_id: e.target.value })}
                />
            </div>
            <div className="sm:col-span-2">
                <InputLabel value="Address (multi-line)" />
                <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows={3}
                    value={form.address ?? ''}
                    onChange={(e) => onChange({ address: e.target.value })}
                />
            </div>
            <div>
                <InputLabel value="City" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.city ?? ''}
                    onChange={(e) => onChange({ city: e.target.value })}
                />
            </div>
            <div>
                <InputLabel value="Country" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.country ?? ''}
                    onChange={(e) => onChange({ country: e.target.value })}
                />
            </div>
            <div className="sm:col-span-2">
                <InputLabel value="Notes" />
                <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows={2}
                    value={form.notes ?? ''}
                    onChange={(e) => onChange({ notes: e.target.value })}
                />
            </div>
        </div>
    );
}
