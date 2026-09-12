
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface StemEditorProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
}

export const StemEditor: React.FC<StemEditorProps> = ({ register, errors }) => {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Historia Clínica (Stem)
            </label>
            <textarea
                {...register("content.stem")}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Escribe el caso clínico aquí..."
            />
            {(errors?.content as any)?.stem && (
                <p className="text-sm text-red-600">{(errors.content as any).stem.message as string}</p>
            )}
        </div>
    );
};
