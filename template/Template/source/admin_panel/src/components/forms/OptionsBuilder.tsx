
import React from 'react';
import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

interface OptionsBuilderProps {
    control: Control<any>;
    register: UseFormRegister<any>;
    errors: any;
}

export const OptionsBuilder: React.FC<OptionsBuilderProps> = ({ control, register, errors }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "options"
    });

    // Helper to visually see which one is selected (though Radio logic is better, checkbox works with manual exclusion logic)
    // For simplicity, we use a checkbox bound to boolean. The Zod schema will enforce exactly one true.
    
    return (
        <div className="space-y-4 border p-4 rounded-md bg-white">
            <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Opciones de Respuesta</h3>
                <button
                    type="button"
                    onClick={() => append({ text: '', is_correct: false, feedback_clinical: '' })}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                >
                    <Plus size={16} />
                    <span>Agregar Opción</span>
                </button>
            </div>

            {errors.options && (
                <p className="text-sm text-red-600 font-medium">
                    {errors.options.message || "Error en las opciones"}
                </p>
            )}

            {fields.map((field, index) => (
                <div key={field.id} className="p-3 border border-gray-200 rounded-lg space-y-2 bg-gray-50/50">
                    <div className="flex items-start gap-2">
                        <div className="pt-2">
                            <input
                                type="checkbox"
                                {...register(`options.${index}.is_correct`)}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                            <input
                                {...register(`options.${index}.text`)}
                                placeholder={`Texto de la opción ${index + 1}`}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500"
                            />
                            <textarea
                                {...register(`options.${index}.feedback_clinical`)}
                                placeholder="Rationale / Explicación clínica (por qué es correcta o incorrecta)"
                                rows={2}
                                className="w-full px-3 py-2 border border-blue-100 rounded focus:ring-blue-500 text-sm bg-blue-50/30"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-gray-400 hover:text-red-600"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
