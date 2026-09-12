
import React from 'react';
import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

interface FindingsBuilderProps {
    control: Control<any>;
    register: UseFormRegister<any>;
}

export const FindingsBuilder: React.FC<FindingsBuilderProps> = ({ control, register }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "content.findings"
    });

    return (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50">
            <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Hallazgos Clínicos / Laboratorio</h3>
                <button
                    type="button"
                    onClick={() => append({ type: 'LAB', label: '', value: '' })}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                >
                    <Plus size={16} />
                    <span>Agregar Hallazgo</span>
                </button>
            </div>

            {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                    <select
                        {...register(`content.findings.${index}.type`)}
                        className="w-1/4 px-2 py-2 border border-gray-300 rounded focus:ring-blue-500"
                    >
                        <option value="LAB">Laboratorio</option>
                        <option value="SIGN">Signo Físico</option>
                        <option value="IMAGE">Imagen</option>
                    </select>

                    <input
                        {...register(`content.findings.${index}.label`)}
                        placeholder="Etiqueta (ej. Latencia)"
                        className="w-1/3 px-2 py-2 border border-gray-300 rounded focus:ring-blue-500"
                    />

                    <input
                        {...register(`content.findings.${index}.value`)}
                        placeholder="Valor (ej. <12ms)"
                        className="w-1/3 px-2 py-2 border border-gray-300 rounded focus:ring-blue-500"
                    />

                    <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            
            {fields.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-2">Sin hallazgos reportados.</p>
            )}
        </div>
    );
};
