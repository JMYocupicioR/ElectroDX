# Instrucciones SQL - Supabase

Este directorio contiene las migraciones y scripts SQL necesarios para la base de datos de RehabiQuiz.

## Estructura

-   `/migrations`: Contiene los archivos `.sql` numerados para mantener el orden de ejecución.

## Archivos

### `0000_init_schema.sql`
**Propósito**: Estructura Inicial.
-   Crea tablas: `islands`, `topics`, `questions`, `user_progress`, `mastery_scores`.
-   Configura RLS (Row Level Security) básico.

### `0001_analytics_triggers.sql`
**Propósito**: Automatización y Analíticas.
-   **Función**: `update_island_mastery()` - Calcula el % de dominio de una isla.
-   **Trigger**: Se ejecuta automáticamente al modificarse `user_progress`.
-   **Políticas**: Permite al administrador ver datos globales para el Dashboard de Analíticas.

### `0002_seed_data.sql`
**Propósito**: Datos Iniciales (Semilla).
-   Inserta **Islas** por defecto (Cardiología, Neumología, etc.).
-   Inserta **Temas** de ejemplo para las primeras islas.
-   Ejecutar esto elimina el mensaje "No hay islas configuradas".

### `0003_rbac_system.sql`
**Propósito**: Control de Acceso Basado en Roles (RBAC).
-   Crea tabla `user_roles` para gestionar roles de usuario.
-   Función `is_admin()` para verificar permisos de administrador.
-   **Políticas RLS actualizadas**: Solo administradores pueden modificar preguntas, islas y temas.
-   Asigna rol 'admin' automáticamente a `jmyocupicior@gmail.com`.

### `0004_user_profiles.sql`
**Propósito**: Perfiles de Usuario.
-   Crea tabla `user_profiles` para almacenar información personal y académica de los médicos.
-   Campos: nombre completo, grado de residencia (R1-R4), especialidad, institución.
-   Trigger automático para crear perfil al registrarse un usuario.

## Cómo aplicar
Copia el contenido de cada archivo (en orden) y ejecútalo en el **SQL Editor** de tu proyecto en Supabase.
