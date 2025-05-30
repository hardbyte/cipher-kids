// src/components/FormField.tsx
import { Field, FormApi, FieldValidators } from '@tanstack/react-form';
import { FieldGroup, Input, Label, FieldError } from '@/components/ui';

/**
 * Generic props inferred from the form's FieldValues
 */
export interface FormFieldProps<
	TValues extends Record<string, unknown>,
	TName extends keyof TValues & string
> {
	/** The form instance returned by useForm() */
	form: FormApi<TValues>;
	/** Name of the field in TValues */
	name: TName;
	/** Standard UI extras */
	label: string;
	type?: React.ComponentProps<'input'>['type'] | 'select' | 'textarea';
	placeholder?: string;
	validators?: FieldValidators<TValues, TName>; // inline rules
	/** Options for select dropdown */
	options?: { value: string | number; label: string }[];
	/** Forward any other <input> props (disabled, autoComplete …) */
	inputProps?: Omit<React.ComponentProps<typeof Input>, 'id' | 'name' | 'value' | 'onChange'>;
}

/**
 * Drop-in field component — works for simple <input> controls.
 * For select/checkbox variants you can copy this pattern and swap the inner control.
 */
export function FormField<
	TValues extends Record<string, unknown>,
	TName extends keyof TValues & string
>({
	form,
	name,
	label,
	type = 'text',
	placeholder,
	validators,
	options,
	inputProps = {}
}: FormFieldProps<TValues, TName>) {
	return (
		<Field form={form} name={name as TName} validators={validators}>
			{field => {
				const error = field.state.meta.errors[0];
				const isInvalid = !!error;

				let control: React.ReactNode;

				if (type === 'select') {
					control = (
						<select
							id={field.name}
							value={field.state.value as string}
							onBlur={field.handleBlur}
							onChange={e => field.handleChange(e.target.value)}
							className={`w-full min-w-0 bg-transparent px-2.5 py-2 text-base text-fg placeholder-muted-fg outline-hidden focus:outline-hidden sm:text-sm/6 border rounded-md ${isInvalid ? 'border-danger' : 'border-input'}`}
							{...(inputProps as React.SelectHTMLAttributes<HTMLSelectElement>)}
						>
							{placeholder && <option value="">{placeholder}</option>}
							{options?.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					);
				} else if (type === 'textarea') {
					control = (
						<textarea
							id={field.name}
							placeholder={placeholder}
							value={field.state.value as string}
							onBlur={field.handleBlur}
							onChange={e => field.handleChange(e.target.value)}
							className={`w-full min-w-0 bg-transparent px-2.5 py-2 text-base text-fg placeholder-muted-fg outline-hidden focus:outline-hidden sm:text-sm/6 border rounded-md ${isInvalid ? 'border-danger' : 'border-input'}`}
							rows={3}
							{...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
						/>
					);
				} else {
					control = (
						<Input
							id={field.name}
							type={type}
							placeholder={placeholder}
							value={field.state.value as string}
							onBlur={field.handleBlur}
							onChange={e => field.handleChange(e.target.value)}
							{...inputProps}
						/>
					);
				}

				return (
					<div className="space-y-1">
						<Label htmlFor={field.name}>{label}</Label>
						<FieldGroup isInvalid={isInvalid}>{control}</FieldGroup>
						<FieldError>{error}</FieldError>
					</div>
				);
			}}
		</Field>
	);
}
