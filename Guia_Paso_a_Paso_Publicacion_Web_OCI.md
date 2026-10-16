[Guia_Paso_a_Paso_Publicacion_Web_OCI.md](https://github.com/user-attachments/files/33549107/Guia_Paso_a_Paso_Publicacion_Web_OCI.md)
# Guía paso a paso: publicar una página web en Oracle Cloud (OCI)

**Asignatura:** Infraestructura y Cloud
**Alcance:** Taller 1 (cuenta, permisos y red) + Taller 2 (servidor, Nginx y publicación de la página)
**Tiempo estimado:** 50 min (Taller 1) + 60 min (Taller 2)

Esta guía reúne en un solo recorrido los dos talleres. Cada paso tiene sus acciones numeradas, los valores que debes configurar, los comandos a ejecutar y la captura de pantalla correspondiente.

---

## Tabla de contenido

**Parte A. Cuenta, permisos y red (Taller 1)**

1. [Ingresar y registrar los datos de la cuenta](#paso-1)
2. [Crear el compartimento](#paso-2)
3. [Crear el grupo de permisos](#paso-3)
4. [Crear la política de acceso](#paso-4)
5. [Crear el usuario de práctica](#paso-5)
6. [Activar el nuevo usuario](#paso-6)
7. [Comprobar el acceso del usuario](#paso-7)
8. [Crear la red virtual (VCN)](#paso-8)
9. [Crear el Internet Gateway y la ruta](#paso-9)
10. [Crear la subred pública](#paso-10)
11. [Configurar la lista de seguridad (puertos 22 y 80)](#paso-11)

**Parte B. Servidor y publicación (Taller 2)**

12. [Ingresar con el usuario de práctica](#paso-12)
13. [Elegir sistema y tamaño de la máquina](#paso-13)
14. [Conectar la máquina a la red](#paso-14)
15. [Guardar la llave SSH y crear la máquina](#paso-15)
16. [Abrir Cloud Shell y preparar la conexión](#paso-16)
17. [Subir la llave y asignar permisos](#paso-17)
18. [Conectarse por SSH al servidor](#paso-18)
19. [Instalar Nginx y Git](#paso-19)
20. [Descargar la página desde Git](#paso-20)
21. [Publicar los archivos y abrir el firewall](#paso-21)
22. [Probar la página desde el navegador](#paso-22)
23. [Consultar costos](#paso-23)
24. [Crear presupuesto y alerta](#paso-24)
25. [Cerrar la práctica: apagar o eliminar la máquina](#paso-25)

[Lista de verificación final](#checklist) · [Solución de problemas](#problemas)

---

## Antes de empezar

- Cuenta de **Oracle Academy Cloud Program** ya activada (300 USD de crédito inicial).
- Navegador web y acceso a tu correo institucional.
- Visual Studio Code (o cualquier editor) para crear `datos-taller.txt`.
- Dirección de clonación del repositorio Git público del taller (en esta práctica: `https://github.com/adanbeltran/ecored-estatica`).

**Archivo de apoyo `datos-taller.txt`** (no escribas contraseñas ni el contenido de la llave privada):

```text
Cuenta:                     <nombre de tu cuenta>
Región principal:           <Home region>
Saldo inicial:              <crédito restante>
Compartimento:              Infraestructura_y_Cloud
Dominio:                    Default
Grupo:                      GrupoInfraestructura
Política:                   PermisosInfraestructura
Usuario:                    estudiante-web
Red (VCN):                  red-infraestructura
Subred:                     subred-web
Ruta de la llave privada:   <ruta de llave-web.key en tu equipo>
IP pública del servidor:    <se completa en el paso 15>
URL de la página:           <se completa en el paso 22>
Presupuesto:                PresupuestoInfraestructura, 5 USD mensuales, alerta al 80 %
```

---

# PARTE A. Cuenta, permisos y red (Taller 1)

<a name="paso-1"></a>

## Paso 1. Ingresar y registrar los datos de la cuenta

Usarás tu cuenta administradora para crear la organización y los permisos.

1. En el navegador escribe `cloud.oracle.com` e inicia sesión con tu cuenta administradora de Oracle Academy Cloud Program. **Mantén esta sesión abierta durante todo el proceso.**
2. En el selector de regiones (barra superior) elige tu **Home region**. Usa la misma región en los dos talleres.
3. En la página de inicio revisa el panel **Cost analysis** o **Subscription credits** y anota el saldo restante.
4. Crea en Visual Studio Code el archivo `datos-taller.txt` y guarda el nombre de la cuenta, la región y el saldo.

![Paso 1 - Inicio de sesión en cloud.oracle.com](https://github.com/user-attachments/assets/c61451ed-b280-4eba-b3ab-893ca535f38d)

![Paso 1 - Selección de la región principal](https://github.com/user-attachments/assets/286da5de-c14b-462e-a090-d61bcdf3c8b0)

![Paso 1 - Panel de créditos de suscripción](https://github.com/user-attachments/assets/2c53413c-0af5-4f7a-85bb-44aa7f33499f)

![Paso 1 - Saldo disponible de la cuenta](https://github.com/user-attachments/assets/a7d77daf-2abe-4bbd-91d6-9d4182f7d926)

[Volver a la tabla de contenido](#tabla-de-contenido)

---

<a name="paso-2"></a>

## Paso 2. Crear el compartimento

El compartimento agrupa todos los recursos de la asignatura. El nombre usa guiones bajos porque la consola no admite espacios.

1. Abre **Identity & Security > Compartments**.
2. Pulsa **Create Compartment** y completa:

| Campo | Valor |
| --- | --- |
| Name | `Infraestructura_y_Cloud` |
| Description | `Recursos de la asignatura Cloud Computing` |
| Parent compartment | Tu cuenta (`root`) |

3. Pulsa **Create Compartment** y comprueba que aparezca en la lista.
4. Registra el nombre exacto en `datos-taller.txt`.

![Paso 2 - Menú Identity & Security > Compartments](https://github.com/user-attachments/assets/6318bded-5a75-4b98-9075-917b2a5cc0bd)

![Paso 2 - Formulario Create Compartment](https://github.com/user-attachments/assets/a9cebd46-cee9-4d41-a9f0-7fa0ebca1f5d)

![Paso 2 - Compartimento creado en la lista](https://github.com/user-attachments/assets/47c999b3-534f-47e8-80d5-32322f5116e0)

---

<a name="paso-3"></a>

## Paso 3. Crear el grupo de permisos

1. Abre **Identity & Security > Domains > Default**.
2. Entra a **User management > Groups** (o **Groups** en el menú lateral).
3. Pulsa **Create group** y completa:

| Campo | Valor |
| --- | --- |
| Name | `GrupoInfraestructura` |
| Description | `Usuarios de la asignatura Infraestructura y Cloud` |
| User can request access | Sin marcar |

4. Pulsa **Create**.
5. Registra el grupo y el dominio (`Default`) en `datos-taller.txt`. Si tu dominio tiene otro nombre, úsalo en los pasos siguientes.

![Paso 3 - Dominio Default](https://github.com/user-attachments/assets/ceff1f49-f52b-45cd-8838-12ba0498aeee)

![Paso 3 - Formulario Create group](https://github.com/user-attachments/assets/424b627c-cb1e-4983-9161-e3d251d3a46f)

![Paso 3 - Grupo creado](https://github.com/user-attachments/assets/5c9b6c10-965c-4a49-8818-da1e5b37292f)

---

<a name="paso-4"></a>

## Paso 4. Crear la política de acceso

La política define qué puede hacer el grupo: administrar red, servidor y disco dentro del compartimento, además de consultar costos y crear alertas de presupuesto.

1. Abre **Identity & Security > Policies** y selecciona el compartimento raíz (`root`).
2. Pulsa **Create Policy** y completa:

| Campo | Valor |
| --- | --- |
| Name | `PermisosInfraestructura` |
| Description | `Permisos para publicar y controlar el gasto del taller` |

3. Activa **Show manual editor** y pega el bloque completo. Si tu dominio no se llama `Default`, cambia únicamente ese nombre en todas las líneas y conserva las comillas simples.

```text
Allow group 'Default'/'GrupoInfraestructura' to inspect compartments in tenancy
Allow group 'Default'/'GrupoInfraestructura' to manage instance-family in compartment Infraestructura_y_Cloud
Allow group 'Default'/'GrupoInfraestructura' to manage volume-family in compartment Infraestructura_y_Cloud
Allow group 'Default'/'GrupoInfraestructura' to manage virtual-network-family in compartment Infraestructura_y_Cloud
Allow group 'Default'/'GrupoInfraestructura' to read app-catalog-listing in tenancy
Allow group 'Default'/'GrupoInfraestructura' to use tag-namespaces in tenancy where target.tag-namespace.name='oracle-tags'
Allow group 'Default'/'GrupoInfraestructura' to read usage-report in tenancy
Allow group 'Default'/'GrupoInfraestructura' to use usage-budgets in tenancy
Allow group 'Default'/'GrupoInfraestructura' to use cloud-shell in tenancy
Allow group 'Default'/'GrupoInfraestructura' to use cloud-shell-public-network in tenancy
```

4. Pulsa **Create** y comprueba que se guarde sin errores. Si la consola rechaza una línea, revisa los nombres del dominio, grupo y compartimento.
5. Registra `PermisosInfraestructura` en `datos-taller.txt`.

![Paso 4 - Menú de políticas](https://github.com/user-attachments/assets/5788a7d5-e6be-4ed4-8d53-b36bdd80d059)

![Paso 4 - Formulario Create Policy](https://github.com/user-attachments/assets/90bef9fd-b459-40a5-9b80-eb7b1344193b)

![Paso 4 - Editor manual con las reglas pegadas](https://github.com/user-attachments/assets/babdcebf-96d3-4693-8732-520f17d4f5e8)

![Paso 4 - Política creada](https://github.com/user-attachments/assets/f1a06e2f-22bd-4e75-849f-1c9ebd2aaa1e)

---

<a name="paso-5"></a>

## Paso 5. Crear el usuario de práctica

Este usuario es distinto del administrador y trabajará con los permisos del grupo.

1. Ve a **Identity & Security > Domains > Default > User management > Users**.
2. Pulsa **Create** y escribe nombre, apellido y correo institucional.
3. Desmarca **Use the email address as the username** y en **Username** escribe `estudiante-web`.
4. En grupos, marca **solo** `GrupoInfraestructura` y pulsa **Create**.
5. Abre el usuario y comprueba que su grupo sea `GrupoInfraestructura` (no debe estar en **Administrators** ni tener roles de administrador).
6. Registra `estudiante-web` en `datos-taller.txt`.

![Paso 5 - Formulario de creación de usuario](https://github.com/user-attachments/assets/e889f0c9-cf2d-4ff5-9834-cd33453d73d4)

![Paso 5 - Usuario con su grupo asignado](https://github.com/user-attachments/assets/2c92f066-04ce-411c-adff-d40abee0d043)

---

<a name="paso-6"></a>

## Paso 6. Activar el nuevo usuario

1. Abre el correo de bienvenida del nuevo usuario y usa la opción de activación.
2. Define una contraseña personal y completa la verificación adicional que solicite la plataforma.
3. Si el correo no llegó, revisa spam. Desde la sesión administradora ve a **Domains > Default > Users**, marca `estudiante-web` y elige **Actions** (o **More actions**) **> Resend invitation > Send invitation**.

![Paso 6 - Correo de bienvenida](https://github.com/user-attachments/assets/e1ecf37f-658d-4b2b-bbe6-efad7949372d)

![Paso 6 - Activación de la cuenta](https://github.com/user-attachments/assets/4dba57a2-d76c-434c-b99c-725b2ee28701)

![Paso 6 - Definir contraseña](https://github.com/user-attachments/assets/a652162b-4bae-44e6-a617-3f74de075711)

![Paso 6 - Verificación adicional](https://github.com/user-attachments/assets/1f989c1b-e21c-49a9-bf8b-5ba12992f072)

![Paso 6 - Configuración del segundo factor](https://github.com/user-attachments/assets/fbe5dc47-ea2b-495a-9072-85e74a75f2dd)

![Paso 6 - Confirmación de verificación](https://github.com/user-attachments/assets/f18f5fd3-dad9-4bb2-91fa-f3d4c5c39842)

![Paso 6 - Usuario activado](https://github.com/user-attachments/assets/21a51390-adf2-4b99-999e-a21b00971313)

---

<a name="paso-7"></a>

## Paso 7. Comprobar el acceso del usuario

Evita descubrir errores de permisos más adelante, cuando ya haya recursos que consuman crédito.

1. Conserva abierta la sesión administradora y abre una **ventana privada** del navegador.
2. Entra a `cloud.oracle.com`, indica el nombre de tu cuenta, selecciona el dominio e inicia sesión con `estudiante-web`.
3. Selecciona la región registrada y abre **Compute > Instances**; elige `Infraestructura_y_Cloud` en el filtro de compartimento.
4. Abre **Create Instance** y **cancela** el formulario. Comprueba también que puedas abrir **Networking > Virtual cloud networks** con el mismo compartimento.
5. Si aparece falta de permisos, revisa la política del [paso 4](#paso-4), corrígela y vuelve a iniciar sesión con el usuario de práctica.
6. Guarda `datos-taller.txt` y una captura de la lista de instancias con el compartimento seleccionado.

![Paso 7 - Lista de instancias con el compartimento seleccionado](https://github.com/user-attachments/assets/0d06ee29-aef2-41ba-95a3-51e2bdf4d91f)

![Paso 7 - Acceso a redes virtuales](https://github.com/user-attachments/assets/ad6441e5-c935-4d20-9023-85c165c70f92)

---

<a name="paso-8"></a>

## Paso 8. Crear la red virtual (VCN)

A partir de aquí trabajas con `estudiante-web`, la región registrada y el compartimento `Infraestructura_y_Cloud`.

1. Abre **Networking > Virtual cloud networks** y selecciona `Infraestructura_y_Cloud`.
2. Pulsa **Create VCN**, usa el formulario de creación manual y completa:

| Campo | Valor |
| --- | --- |
| Name | `red-infraestructura` |
| Compartment | `Infraestructura_y_Cloud` |
| IPv4 CIDR Blocks | `10.0.0.0/16` |

3. Deja IPv6 sin habilitar, conserva los demás valores y pulsa **Create VCN**.
4. Registra `red-infraestructura` en `datos-taller.txt`.

![Paso 8 - Formulario de creación de la VCN](https://github.com/user-attachments/assets/879d1e44-eab0-4441-9907-c20549f34c01)

---

<a name="paso-9"></a>

## Paso 9. Crear el Internet Gateway y la ruta

El Internet Gateway conecta la red con Internet; la regla de ruta indica que el tráfico externo debe usarlo.

**9.1 Crear el Internet Gateway**

1. Dentro de `red-infraestructura`, abre **Gateways > Internet gateways > Create Internet Gateway**.
2. Escribe el nombre `salida-internet`, selecciona `Infraestructura_y_Cloud` y pulsa **Create Internet Gateway**.

![Paso 9.1 - Crear Internet Gateway](https://github.com/user-attachments/assets/c037396c-ebd0-4d0b-9c52-8fed842d4faa)

![Paso 9.1 - Gateway en la lista](https://github.com/user-attachments/assets/c52f750f-5112-4cb5-9af0-d26dc6d4e2c2)

![Paso 9.1 - Gateway disponible](https://github.com/user-attachments/assets/6f34aba1-262f-42c0-ac66-3fdd7ab10264)

**9.2 Agregar la regla de ruta**

1. Abre **Routing > Route tables > Default Route Table for red-infraestructura > Add Route Rules**.
2. Completa y guarda:

| Campo | Valor |
| --- | --- |
| Target Type | **Internet Gateway** |
| Destination Type | **CIDR Block** |
| Destination CIDR Block | `0.0.0.0/0` |
| Target | `salida-internet` |

`0.0.0.0/0` representa todas las direcciones externas.

![Paso 9.2 - Tabla de rutas por defecto](https://github.com/user-attachments/assets/83901dae-84a4-48d0-91b0-bf6b06581fd9)

![Paso 9.2 - Formulario Add Route Rules](https://github.com/user-attachments/assets/d705b5ac-3c93-456d-9a6a-9f15400a4e63)

![Paso 9.2 - Regla guardada](https://github.com/user-attachments/assets/4a702a5d-b989-44df-974e-e41f36142379)

![Paso 9.2 - Tabla de rutas con la regla hacia salida-internet](https://github.com/user-attachments/assets/dd4e4420-af7d-4037-954f-014905052125)

---

<a name="paso-10"></a>

## Paso 10. Crear la subred pública

1. En `red-infraestructura`, abre **Subnets > Create Subnet**.
2. Completa los datos generales:

| Campo | Valor |
| --- | --- |
| Name | `subred-web` |
| Create in Compartment | `Infraestructura_y_Cloud` |
| Subnet Type | **Regional (Recommended)** |
| IP Type | **IPv4 CIDR Block** |
| IPv4 CIDR Block | `10.0.0.0/24` |

![Paso 10 - Datos generales de la subred](https://github.com/user-attachments/assets/21272054-dcef-4d38-b77a-63e28e907006)

![Paso 10 - Bloque CIDR de la subred](https://github.com/user-attachments/assets/48487a82-58d9-4e77-bcb3-b494bf2089aa)

3. Completa el resto de la configuración:

| Campo | Valor |
| --- | --- |
| Route Table compartment / Route Table | `Infraestructura_y_Cloud` / **Default Route Table for red-infraestructura** |
| Subnet Access | **Public Subnet** |
| Use DNS hostnames in this Subnet | Marcado |
| DNS Label | `web` |
| DHCP Options compartment / DHCP Options | `Infraestructura_y_Cloud` / **Default DHCP Options for red-infraestructura** |
| Security List compartment / Security List | `Infraestructura_y_Cloud` / **Default Security List for red-infraestructura** |
| Resource logging | Desactivado |
| Tags | Sin etiquetas |

4. Al final del formulario revisa los valores y pulsa **Create Subnet**.
5. Abre los detalles de `subred-web` y verifica: acceso público, rango `10.0.0.0/24`, tabla de rutas y lista de seguridad.
6. Registra `subred-web` en `datos-taller.txt`.

![Paso 10 - Subred en la lista](https://github.com/user-attachments/assets/387e7eb1-80c3-43f3-9fd0-fab2edf24bda)

![Paso 10 - Detalles de la subred](https://github.com/user-attachments/assets/35bd7e33-05d2-4a47-8910-58e90493943e)

![Paso 10 - Verificación de ruta y lista de seguridad](https://github.com/user-attachments/assets/f7d70096-843e-4377-9a74-a051a26fa54d)

---

<a name="paso-11"></a>

## Paso 11. Configurar la lista de seguridad (puertos 22 y 80)

El puerto **22** permite la administración por SSH (requiere la llave privada) y el puerto **80** permite las solicitudes HTTP de la página.

1. Abre **Security > Security Lists > Default Security List for red-infraestructura > Ingress Rules**.
2. Si existe la regla del puerto 22, compara con la tabla; si falta, créala con **Add Ingress Rules**. Agrega también la del puerto 80.

| Source CIDR | IP Protocol | Source Port Range | Destination Port Range |
| --- | --- | --- | --- |
| `0.0.0.0/0` | **TCP** | **All** | `22` |
| `0.0.0.0/0` | **TCP** | **All** | `80` |

3. En ambas reglas usa **Source Type: CIDR** y deja **Stateless** desmarcado.
4. En **Egress Rules** comprueba que exista una regla con **Destination CIDR `0.0.0.0/0`**, **IP Protocol: All Protocols** y **Stateless** desmarcado. Si no existe, créala.
5. Abre `subred-web` y confirma que use la tabla de rutas y la lista de seguridad de esta parte.

![Paso 11 - Reglas de entrada (Ingress Rules)](https://github.com/user-attachments/assets/4deebe76-1b27-4350-86d3-2ed35f28a9b9)

![Paso 11 - Reglas de entrada con puertos 22 y 80](https://github.com/user-attachments/assets/58921d6d-e92a-44d5-a080-2f4070519aaf)

---

# PARTE B. Servidor y publicación (Taller 2)

<a name="paso-12"></a>

## Paso 12. Ingresar con el usuario de práctica

1. Abre una **ventana privada** del navegador, escribe `cloud.oracle.com` e inicia sesión con el nombre de tu cuenta, tu dominio y `estudiante-web`.
2. Selecciona la región registrada en `datos-taller.txt` y usa `Infraestructura_y_Cloud` en los filtros de compartimento.
3. Mantén disponible la sesión administradora por si aparece falta de permisos: revisa en **Identity & Security > Policies > PermisosInfraestructura** los nombres de grupo y compartimento, y vuelve a iniciar sesión con el usuario de práctica.

---

<a name="paso-13"></a>

## Paso 13. Elegir sistema y tamaño de la máquina

Usa un tamaño pequeño: una máquina encendida consume crédito.

1. Abre **Compute > Instances**, selecciona `Infraestructura_y_Cloud` y pulsa **Create Instance**.
2. Completa la configuración:

| Campo | Valor |
| --- | --- |
| Name | `servidor-web` |
| Placement | Un dominio de disponibilidad de tu región, **On-demand capacity** |
| Image | **Oracle Linux 9** (Image and shape > Change Image) |
| Shape | **Virtual Machine > AMD > `VM.Standard.E4.Flex`** (si no está disponible, `VM.Standard.E5.Flex`) |
| OCPU | `1` |
| Memoria | `2 GB` |

3. Pulsa **Select Shape** y revisa los valores y el costo estimado antes de continuar.

![Paso 13 - Formulario Create Instance](https://github.com/user-attachments/assets/508e6f2f-ae12-42e9-820a-972035922837)

![Paso 13 - Selección de la imagen Oracle Linux 9](https://github.com/user-attachments/assets/1ada159f-dfbf-4366-890d-fabf5adf3a1d)

![Paso 13 - Selección del shape AMD](https://github.com/user-attachments/assets/db5189b1-6f18-4b0a-8209-e3bb78ee737f)

![Paso 13 - 1 OCPU y 2 GB de memoria](https://github.com/user-attachments/assets/ef533f9e-4a05-4fe3-9cf3-51628a92f9b2)

---

<a name="paso-14"></a>

## Paso 14. Conectar la máquina a la red

1. En **Networking** selecciona la red existente `red-infraestructura` y la subred existente `subred-web` (compartimento `Infraestructura_y_Cloud`).
2. Activa **Assign a public IPv4 address** y conserva la asignación automática de la dirección privada.
3. Deja **Network security groups** sin habilitar: se usa la lista de seguridad del paso 11.

![Paso 14 - Configuración de red de la instancia](https://github.com/user-attachments/assets/612cf0d8-baa3-4745-96bc-927420e7626a)

---

<a name="paso-15"></a>

## Paso 15. Guardar la llave SSH y crear la máquina

1. En **Add SSH keys** selecciona **Generate a key pair for me** y descarga **Save Private Key** y **Save Public Key**.
2. En tu equipo renombra el archivo privado como `llave-web.key` (sin agregar `.txt`) y conserva también el público. Guarda en `datos-taller.txt` **la ruta** del archivo privado, no su contenido.

![Paso 15 - Generación del par de llaves SSH](https://github.com/user-attachments/assets/32c5c395-f80e-4476-ae67-60e0cee6007b)

3. En **Boot volume** conserva el tamaño predeterminado, sin discos adicionales ni copias de seguridad.
4. Revisa el resumen y pulsa **Create**. Espera el estado **Running** y dos minutos más para el arranque del sistema.
5. Si aparece falta de capacidad, cambia el dominio de disponibilidad (misma región) o usa el otro shape del [paso 13](#paso-13).
6. En la ficha del servidor copia **Public IP Address** y guárdala en `datos-taller.txt`. No uses la dirección privada para conectarte desde tu equipo.

![Paso 15 - Instancia en estado Running con su IP pública](https://github.com/user-attachments/assets/4c7a8a22-7a68-4ec5-9961-1e7105d37c8b)

---

<a name="paso-16"></a>

## Paso 16. Abrir Cloud Shell y preparar la conexión

Cloud Shell es la terminal integrada de OCI. Es un equipo distinto de `servidor-web`: desde ahí te conectarás por SSH.

1. En **Compute > Instances** abre `servidor-web`, comprueba el estado **Running** y copia su **Public IP Address**.

![Paso 16 - IP pública del servidor](https://github.com/user-attachments/assets/642a78dd-3a8f-4b85-ba34-b67d372572cf)

2. En la barra superior abre el icono de terminal o **Developer tools > Cloud Shell**. Espera a que aparezca la línea de comandos (misma región donde creaste el servidor).

![Paso 16 - Abrir Cloud Shell](https://github.com/user-attachments/assets/86db4005-e512-4aa9-90ba-1024efbc4642)

3. En el selector de red de Cloud Shell comprueba que esté en **Public Network**. Si aparece **Service Network**, cámbiala: la red de servicios no llega a la dirección pública del servidor.

![Paso 16 - Selector de red de Cloud Shell](https://github.com/user-attachments/assets/178da6fe-857a-41dc-9b0e-e4b9e538ef56)

---

<a name="paso-17"></a>

## Paso 17. Subir la llave y asignar permisos

1. En el menú de Cloud Shell selecciona **Upload** y carga `llave-web.key` en tu carpeta personal. Espera la confirmación de carga.

![Paso 17 - Menú Upload de Cloud Shell](https://github.com/user-attachments/assets/fa6c84b7-7e78-49ae-a1cb-3a62582cd069)

![Paso 17 - Carga de llave-web.key](https://github.com/user-attachments/assets/9b6efa1d-3312-4bd5-844c-0c248a59a374)

2. Ejecuta en **Cloud Shell**:

```bash
ls -l ~/llave-web.key
chmod 600 ~/llave-web.key
```

| Orden | Qué hace |
| --- | --- |
| `ls -l ~/llave-web.key` | Comprueba que el archivo exista y muestra permisos, propietario y tamaño (no muestra la llave). |
| `chmod 600 ~/llave-web.key` | Solo el propietario puede leer y modificar el archivo. |

`~` es tu carpeta personal en Cloud Shell. El valor `600` significa: propietario `6` (4 lectura + 2 escritura), grupo `0` y otros `0` (sin permisos). SSH rechaza llaves con permisos demasiado abiertos.

![Paso 17 - Resultado de ls y chmod](https://github.com/user-attachments/assets/860bd47c-8b4d-48ec-8fe5-92d92ad64367)

---

<a name="paso-18"></a>

## Paso 18. Conectarse por SSH al servidor

1. Sustituye `DIRECCION_PUBLICA` por la IP pública copiada y ejecuta en **Cloud Shell**:

```bash
ssh -i ~/llave-web.key opc@DIRECCION_PUBLICA
```

![Paso 18 - Comando ssh](https://github.com/user-attachments/assets/bc6d06a3-1bf8-45c2-9f0f-a09617587330)

2. En la primera conexión escribe `yes` para confirmar y pulsa **Enter**. La terminal debe quedar dentro de `servidor-web`.
3. Comprueba el usuario:

```bash
whoami
```

Debe responder `opc` (usuario del sistema en Oracle Linux 9). **Mantén abierta esta conexión**: los pasos 19 a 21 se ejecutan dentro del servidor.

![Paso 18 - Resultado de whoami](https://github.com/user-attachments/assets/0048cf2b-044d-46cf-939d-639b90169bc8)

---

<a name="paso-19"></a>

## Paso 19. Instalar Nginx y Git

Ejecuta **dentro de `servidor-web`**, una orden a la vez:

1. Instalar Nginx (servidor web) y Git:

```bash
sudo dnf install -y nginx git
```

![Paso 19 - Instalación de Nginx y Git](https://github.com/user-attachments/assets/8c02cebf-4755-40cb-826e-a74bc449464f)

2. Iniciar Nginx y dejarlo activo en cada reinicio:

```bash
sudo systemctl enable --now nginx
```

![Paso 19 - Habilitar e iniciar Nginx](https://github.com/user-attachments/assets/e0dd8576-6d24-458f-a0d5-4bc47494d82a)

3. Comprobar el estado (debe mostrar `active`):

```bash
systemctl is-active nginx
```

![Paso 19 - Nginx activo](https://github.com/user-attachments/assets/8f99a57d-a261-4180-9858-d6a2ace7f851)

---

<a name="paso-20"></a>

## Paso 20. Descargar la página desde Git

`index.html` define la estructura (HTML), los archivos CSS el diseño y JavaScript las interacciones.

1. Clona el repositorio dentro del servidor:

```bash
git clone --depth 1 "https://github.com/adanbeltran/ecored-estatica" ~/pagina-taller
```

![Paso 20 - Clonación del repositorio](https://github.com/user-attachments/assets/05a4bbbc-b8eb-4516-bb71-3de3677593b3)

2. Verifica que los archivos estén en la carpeta (debe aparecer `index.html`):

```bash
ls -la ~/pagina-taller
```

![Paso 20 - Contenido del repositorio](https://github.com/user-attachments/assets/ff4387bc-0c5f-4771-b87b-9a44f80c1621)

---

<a name="paso-21"></a>

## Paso 21. Publicar los archivos y abrir el firewall

La regla de la subred (paso 11) y el firewall del sistema son controles distintos; ambos deben permitir HTTP.

1. Copiar los archivos de la versión del repositorio a la carpeta de Nginx (sin la carpeta interna `.git`):

```bash
git -C ~/pagina-taller archive --format=tar HEAD | sudo tar -x -C /usr/share/nginx/html
```

![Paso 21 - Copia de archivos a Nginx](https://github.com/user-attachments/assets/e9fcf543-98b6-475c-b8a8-bd40eb9464e2)

2. Ajustar el contexto de seguridad (SELinux) y validar la configuración de Nginx:

```bash
sudo restorecon -Rv /usr/share/nginx/html
sudo nginx -t
```

![Paso 21 - restorecon y nginx -t](https://github.com/user-attachments/assets/927551b8-04fe-4a1d-a6bd-f0c1952e8ca7)

3. Permitir HTTP en el firewall y probar desde la propia máquina:

```bash
sudo firewall-cmd --permanent --add-service=http
```

```bash
sudo firewall-cmd --reload
```

```bash
curl -I http://localhost/index.html
```

Debes ver `success` en las dos órdenes del firewall y `200 OK` en la última. Mantén la sesión abierta.

![Paso 21 - Firewall y respuesta 200 OK](https://github.com/user-attachments/assets/337d6b76-d1ee-49b8-b1fa-73fe05d92f10)

---

<a name="paso-22"></a>

## Paso 22. Probar la página desde el navegador

1. En el navegador de tu equipo abre `http://DIRECCION_PUBLICA/index.html` (usa `http`, no `https`).

![Paso 22 - Dirección en el navegador](https://github.com/user-attachments/assets/50a77a99-76ff-4eb7-8d30-ddcd30c492a1)

![Paso 22 - Página publicada](https://github.com/user-attachments/assets/a2fa6707-0e3c-45b6-b066-d2198e079240)

2. Comprueba que aparezca la página y prueba un botón, menú o filtro.
3. Abre **F12 > Network**, recarga y revisa que la página y sus archivos de diseño e interactividad respondan con estado **200**. En **Console** no debe haber errores.
4. Abre la misma dirección en una ventana privada o en un teléfono con datos móviles, repite una interacción y guarda una captura de la dirección y del resultado.
5. Guarda la URL en `datos-taller.txt`.

Si la página no abre, revisa la IP pública, el estado **Running**, la regla del puerto 80 y, dentro del servidor:

```bash
systemctl is-active nginx
sudo firewall-cmd --list-services
```

Deben mostrar `active` y `http`. Si falta el servicio web, repite el [paso 21](#paso-21).

---

<a name="paso-23"></a>

## Paso 23. Consultar costos

1. Con `estudiante-web` abre **Billing & Cost Management > Cost Management > Cost Analysis**.

![Paso 23 - Cost Analysis](https://github.com/user-attachments/assets/51052601-f3e5-41a3-b82d-8c471a08c4a0)

2. Selecciona el período, filtra por `Infraestructura_y_Cloud`, agrupa por **Service** y pulsa **Apply**. Guarda una captura o registra el resultado en `datos-taller.txt`. Si no hay datos, anótalo: la información puede tardar hasta 48 horas.

![Paso 23 - Costos filtrados por compartimento](https://github.com/user-attachments/assets/54326d20-b009-425b-978a-e314c31f62a2)

---

<a name="paso-24"></a>

## Paso 24. Crear presupuesto y alerta

El presupuesto es solo una referencia: **no detiene** la máquina ni bloquea el consumo.

1. Abre **Billing & Cost Management > Cost Management > Budgets > Create Budget** y completa:

| Campo | Valor |
| --- | --- |
| Name | `PresupuestoInfraestructura` |
| Budget Scope | **Compartment** |
| Target Compartment | `Infraestructura_y_Cloud` |
| Schedule | **Monthly** |
| Budget Amount | `5` (registra la moneda que indique la consola; si es USD, 5 dólares mensuales) |

![Paso 24 - Formulario Create Budget](https://github.com/user-attachments/assets/aac5a32a-a5fe-4101-a797-97c18f9e9309)

2. Si ya existe un presupuesto para este compartimento, abre ese en lugar de crear otro.
3. En la sección de alerta (o **Budget Alert Rules > Create Budget Alert Rule**) selecciona:

| Campo | Valor |
| --- | --- |
| Alert type | **Actual Spend** |
| Threshold metric | **Percentage of Budget** |
| Threshold % | `80` |
| Email Recipients | Tu correo institucional |

4. Guarda y comprueba que la regla quede asociada al presupuesto.
5. Si faltan permisos, verifica desde la sesión administradora que `PermisosInfraestructura` incluya `read usage-report` y `use usage-budgets` en `tenancy`.
6. Desde la sesión administradora revisa el saldo restante del crédito y guárdalo en `datos-taller.txt` junto con el monto y el umbral.

![Paso 24 - Presupuesto y regla de alerta](https://github.com/user-attachments/assets/6128c9d9-1ca0-494a-9d2c-ee6293ab4bfb)

---

<a name="paso-25"></a>

## Paso 25. Cerrar la práctica: apagar o eliminar la máquina

Conserva las evidencias (`datos-taller.txt`, captura de la página y del presupuesto). **No incluyas la llave privada.**

1. En la sesión del servidor escribe `exit` para volver a la terminal de Cloud Shell.

```bash
exit
```

**Opción A. Apagar la máquina (Stop)**

2. Abre **Compute > Instances**, pulsa los tres puntos (**...**) de `servidor-web` y elige **Stop**.
3. Comprueba que el estado cambie a detenida.

![Paso 25 - Menú de acciones con Stop](https://github.com/user-attachments/assets/a766dc2d-54e0-457f-8c8f-9bc85c097739)

![Paso 25 - Instancia detenida](https://github.com/user-attachments/assets/c7072e9c-4f08-4f33-ac13-f788fcc46b55)

**Opción B. Eliminar la máquina y su disco (Terminate)**

2. En **Compute > Instances > servidor-web**, abre el menú de acciones y selecciona **Terminate**.
3. Activa **Permanently delete the attached boot volume** y confirma. Espera el estado **Terminated**.
4. Abre **Storage > Block Storage > Boot Volumes**, selecciona `Infraestructura_y_Cloud` y el mismo dominio de disponibilidad, y comprueba que el disco de `servidor-web` esté eliminado o en **Terminated**.

> **Nota:** apagar (Stop) detiene el cómputo, pero el disco de arranque sigue existiendo. Si ya no necesitas el servidor, usa la opción B para no conservar recursos.

[Volver a la tabla de contenido](#tabla-de-contenido)

---

<a name="checklist"></a>

## Lista de verificación final

- [ ] Compartimento `Infraestructura_y_Cloud` creado
- [ ] Grupo `GrupoInfraestructura` y política `PermisosInfraestructura` creados
- [ ] Usuario `estudiante-web` activado y con acceso comprobado
- [ ] VCN `red-infraestructura`, gateway `salida-internet` y regla de ruta `0.0.0.0/0`
- [ ] Subred pública `subred-web` (`10.0.0.0/24`)
- [ ] Reglas de entrada TCP 22 y 80 en la lista de seguridad
- [ ] `servidor-web` (Oracle Linux 9, 1 OCPU, 2 GB) en estado Running con IP pública
- [ ] Llave `llave-web.key` con permisos `600` y conexión SSH como `opc`
- [ ] Nginx activo, repositorio clonado y archivos publicados
- [ ] Firewall con servicio `http` y `curl` devolviendo `200 OK`
- [ ] Página visible desde el navegador y desde otro dispositivo
- [ ] Presupuesto `PresupuestoInfraestructura` con alerta al 80 %
- [ ] Máquina detenida o eliminada

---

<a name="problemas"></a>

## Solución de problemas

| Síntoma | Qué revisar |
| --- | --- |
| Falta de permisos al crear recursos | Política `PermisosInfraestructura`: nombres de dominio, grupo y compartimento. Cierra sesión y vuelve a entrar. |
| `Out of capacity` al crear la instancia | Cambia el dominio de disponibilidad o usa `VM.Standard.E5.Flex`. |
| `No such file or directory` / `Identity file ... not accessible` | Nombre `llave-web.key` y que la carga en Cloud Shell haya terminado. |
| `Permission denied (publickey)` | Usuario `opc` y llave del par creado con la máquina. |
| `Connection timed out` | Cloud Shell en **Public Network**, IP pública correcta, estado Running, regla del puerto 22 y ruta a `salida-internet`. |
| La página no abre en el navegador | Regla del puerto 80, `systemctl is-active nginx` = `active`, `firewall-cmd --list-services` incluye `http`, y usa `http://` (no `https://`). |
| Sin datos en Cost Analysis | Puede tardar hasta 48 horas en aparecer. |
