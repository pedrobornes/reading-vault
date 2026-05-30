package com.readingvault.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.readingvault.models.Comunidad;
import com.readingvault.models.Libro;
import com.readingvault.models.MensajeComunidad;
import com.readingvault.models.Usuario;
import com.readingvault.models.UsuarioComunidad;
import com.readingvault.repositories.ComunidadRepository;
import com.readingvault.repositories.LibroRepository;
import com.readingvault.repositories.MensajeComunidadRepository;
import com.readingvault.repositories.UsuarioComunidadRepository;
import com.readingvault.repositories.UsuarioRepository;
import com.readingvault.services.CloudinaryService;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/comunidades")
@CrossOrigin(origins = "${FRONTEND_URL}")
public class ComunidadController {

    private final MensajeComunidadRepository mensajeComunidadRepository;

    @Autowired
    private ComunidadRepository comunidadRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioComunidadRepository usuarioComunidadRepository;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    ComunidadController(MensajeComunidadRepository mensajeComunidadRepository) {
        this.mensajeComunidadRepository = mensajeComunidadRepository;
    }

    @GetMapping
    public ResponseEntity<List<Comunidad>> obtenerTodasLasComunidades() {
        List<Comunidad> comunidades = comunidadRepository.findAll();
        return ResponseEntity.ok(comunidades);
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearComunidad(
            @RequestParam("nombre") String nombre,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("idLibro") Long idLibro,
            @RequestParam(value = "foto", required = false) MultipartFile foto) {

        try {
            Usuario creador = usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> new Exception("Usuario no encontrado"));

            // Recuperamos el libro de la base de datos
            Libro libro = libroRepository.findById(idLibro)
                    .orElseThrow(() -> new Exception("Libro no encontrado en base de datos"));

            Comunidad nuevaComunidad = new Comunidad();
            nuevaComunidad.setNombre(nombre);
            nuevaComunidad.setDescripcion(descripcion);
            nuevaComunidad.setFechaCreacion(LocalDate.now().toString());
            nuevaComunidad.setLibro(libro);

            if (foto != null && !foto.isEmpty()) {
                nuevaComunidad.setFoto(cloudinaryService.subirFoto(foto));
            } else {
                nuevaComunidad.setFoto("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&auto=format&fit=crop");
            }

            Comunidad comunidadGuardada = comunidadRepository.save(nuevaComunidad);

            UsuarioComunidad relacion = new UsuarioComunidad();
            relacion.setUsuario(creador);
            relacion.setComunidad(comunidadGuardada);
            relacion.setFechaUnion(LocalDate.now().toString());
            relacion.setRol("admin");
            usuarioComunidadRepository.save(relacion);

            return ResponseEntity.ok(comunidadGuardada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear el club de lectura: " + e.getMessage());
        }
    }

    // Obtener el detalle de una comunidad (incluyendo libro y mensajes)
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerDetalleComunidad(@PathVariable("id") Long id) {
        try {
            Comunidad comunidad = comunidadRepository.findById(id)
                    .orElseThrow(() -> new Exception("La comunidad no existe"));

            // Para que los mensajes vengan ordenados por fecha descendente:
            // List<MensajeComunidad> mensajes =
            // mensajeRepository.findByComunidadOrderByFechaDesc(comunidad);
            // comunidad.setMensajes(mensajes);

            return ResponseEntity.ok(comunidad);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // 2. Publicar un mensaje en el muro
    @PostMapping("/{id}/mensajes")
    public ResponseEntity<?> publicarMensaje(
            @PathVariable("id") Long idComunidad,
            @RequestBody Map<String, Object> payload) {
        try {
            Long idUsuario = Long.valueOf(payload.get("idUsuario").toString());
            String contenido = (String) payload.get("contenido");

            Comunidad comunidad = comunidadRepository.findById(idComunidad)
                    .orElseThrow(() -> new Exception("Comunidad no encontrada"));

            Usuario usuario = usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> new Exception("Usuario no encontrado"));

            MensajeComunidad nuevoMensaje = new MensajeComunidad();
            nuevoMensaje.setContenido(contenido);
            nuevoMensaje.setUsuario(usuario);
            nuevoMensaje.setComunidad(comunidad);
            // Formateamos la fecha actual de forma amigable (Ej: "16 May, 13:20")
            nuevoMensaje.setFecha(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM, HH:mm")));

            mensajeComunidadRepository.save(nuevoMensaje);

            return ResponseEntity.ok(nuevoMensaje);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al publicar mensaje: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/unirse")
    @Transactional
    public ResponseEntity<?> unirseGrupo(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        Long idUsuario = payload.get("idUsuario");

        Comunidad comunidad = comunidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comunidad no encontrada"));

        // Verificamos si ya existe
        if (usuarioComunidadRepository.existsByComunidadIdComunidadAndUsuarioIdUsuario(id, idUsuario)) {
            return ResponseEntity.ok(comunidad);
        }

        // Si no existe, creamos la relación
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UsuarioComunidad relacion = new UsuarioComunidad();
        relacion.setUsuario(usuario);
        relacion.setComunidad(comunidad);
        relacion.setRol("miembro");
        relacion.setFechaUnion(LocalDate.now().toString());

        // Guardamos la relación
        usuarioComunidadRepository.save(relacion);

        // Añadimos la relación a la lista de la comunidad en memoria
        comunidad.getMiembros().add(relacion);
        
        // Devolvemos la misma comunidad que ya tiene el miembro nuevo añadido en la lista
        return ResponseEntity.ok(comunidad);
    }

    @PostMapping("/{id}/actualizar-progreso")
    public ResponseEntity<?> actualizarProgreso(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Comunidad c = comunidadRepository.findById(id).get();
        c.setPaginaActual(Integer.parseInt(payload.get("pagina").toString()));
        c.setTotalPaginas(Integer.parseInt(payload.get("total").toString()));
        c.setNotaProgreso(payload.get("nota").toString());
        comunidadRepository.save(c);
        return ResponseEntity.ok(c);
    }

    @PostMapping("/{id}/cambiar-libro")
    public ResponseEntity<?> cambiarLibro(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        if (!payload.containsKey("idLibro")) {
            return ResponseEntity.badRequest().body("Se requiere un idLibro válido de la base de datos.");
        }

        Long idLibro = Long.valueOf(payload.get("idLibro").toString());
        
        Comunidad c = comunidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comunidad no encontrada"));
        
        Libro libroNuevo = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado en base de datos"));

        c.setLibro(libroNuevo);
        c.setPaginaActual(0);
        c.setTotalPaginas(0);
        c.setNotaProgreso("");
        comunidadRepository.save(c);
        
        return ResponseEntity.ok(c);
    }

    @GetMapping("/buscar-libro-externo")
    public ResponseEntity<?> buscarLibroGoogle(@RequestParam("q") String query) {
        try {
            String queryLimpia = query.replace(" ", "%20");
            String url = "https://www.googleapis.com/books/v1/volumes?q=" + queryLimpia + "&maxResults=10";

            // Hacemos la llamada directa a Google Books
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String respuestaJson = restTemplate.getForObject(url, String.class);

            // Devolvemos el JSON de Google tal cual a React
            return ResponseEntity.ok(respuestaJson);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al buscar en Google Books: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/salir")
    @Transactional 
    public ResponseEntity<?> salirGrupo(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Long idUsuario = Long.valueOf(payload.get("idUsuario").toString());
        
        Comunidad comunidad = comunidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comunidad no encontrada"));

        // Busca el miembro
        Optional<UsuarioComunidad> relacion = usuarioComunidadRepository
                .findByComunidadIdComunidadAndUsuarioIdUsuario(id, idUsuario);
        
        if (relacion.isPresent()) {
            comunidad.getMiembros().remove(relacion.get());
            // Elimina de DB
            usuarioComunidadRepository.delete(relacion.get());
            // Fuerza sincronización con DB
            usuarioComunidadRepository.flush(); 
        }

        // Comprueba tamaño seguro
        if (comunidad.getMiembros().size() == 0) {
            // Borra grupo vacío
            comunidadRepository.delete(comunidad);
            return ResponseEntity.ok("Grupo eliminado por quedar vacío");
        }

        // Guarda si aún hay gente
        comunidadRepository.save(comunidad);
        return ResponseEntity.ok(comunidad);
    }

    @DeleteMapping("/mensajes/{idMensaje}")
    @Transactional
    public ResponseEntity<?> borrarMensaje(@PathVariable Long idMensaje) {
        // Buscamos el mensaje y lo eliminamos
        if (mensajeComunidadRepository.existsById(idMensaje)) {
            mensajeComunidadRepository.deleteById(idMensaje);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/mensajes/{idMensaje}")
    public ResponseEntity<?> editarMensaje(@PathVariable Long idMensaje, @RequestBody Map<String, String> payload) {
        return mensajeComunidadRepository.findById(idMensaje).map(msg -> {
            msg.setContenido(payload.get("contenido"));
            MensajeComunidad actualizado = mensajeComunidadRepository.save(msg);
            return ResponseEntity.ok(actualizado);
        }).orElse(ResponseEntity.notFound().build());
    }

    // EXPULSAR MIEMBRO
    @DeleteMapping("/{idComunidad}/expulsar/{idUsuario}")
    @Transactional
    public ResponseEntity<?> expulsarMiembro(@PathVariable Long idComunidad, @PathVariable Long idUsuario, @RequestBody Map<String, Long> payload) {
        
        // Obtener usuario que ejecuta la accion
        Long idSolicitante = payload.get("idUsuario");
        Usuario solicitante = usuarioRepository.findById(idSolicitante).orElseThrow();

        // Comprobar si es admin del sistema
        boolean esAdminSistema = "ADMIN".equalsIgnoreCase(solicitante.getRol());
        
        // Comprobar si es admin del grupo
        boolean esAdminGrupo = usuarioComunidadRepository
                .findByComunidadIdComunidadAndUsuarioIdUsuario(idComunidad, idSolicitante)
                .map(uc -> "admin".equals(uc.getRol()))
                .orElse(false);

        // Si tiene alguno de los dos permisos, procedemos a borrar
        if (esAdminSistema || esAdminGrupo) {
            Optional<UsuarioComunidad> relacion = usuarioComunidadRepository
                    .findByComunidadIdComunidadAndUsuarioIdUsuario(idComunidad, idUsuario);
            
            if (relacion.isPresent()) {
                usuarioComunidadRepository.delete(relacion.get());
                usuarioComunidadRepository.flush(); // Sincroniza con DB
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        }

        // Bloquear accion si no tiene permisos
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permisos para expulsar");
    }

    // CEDER ADMINISTRACIÓN
    @PutMapping("/{idComunidad}/cambiar-admin/{idUsuarioNuevo}")
    @Transactional
    public ResponseEntity<?> cederAdministracion(@PathVariable Long idComunidad, @PathVariable Long idUsuarioNuevo) {
        // Buscamos al admin actual (el que hace la petición)
        List<UsuarioComunidad> miembros = usuarioComunidadRepository.findByComunidadIdComunidad(idComunidad);
        
        UsuarioComunidad adminActual = miembros.stream()
                .filter(m -> "admin".equals(m.getRol()))
                .findFirst()
                .orElse(null);

        UsuarioComunidad nuevoAdmin = miembros.stream()
                .filter(m -> m.getUsuario().getIdUsuario().equals(idUsuarioNuevo))
                .findFirst()
                .orElse(null);

        if (adminActual != null && nuevoAdmin != null) {
            // Degradamos al actual
            adminActual.setRol("miembro");
            usuarioComunidadRepository.save(adminActual);
            
            // Ascendemos al nuevo
            nuevoAdmin.setRol("admin");
            usuarioComunidadRepository.save(nuevoAdmin);
            
            return ResponseEntity.ok().build();
        }
        
        return ResponseEntity.badRequest().body("No se pudo realizar el cambio de roles");
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> eliminarComunidad(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        Long idUsuarioActual = payload.get("idUsuario");

        Comunidad comunidad = comunidadRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Comunidad no encontrada"));

        // Buscamos al usuario para ver su rol global
        Usuario usuario = usuarioRepository.findById(idUsuarioActual)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Comprobar permisos
        boolean esAdminSistema = "ADMIN".equals(usuario.getRol());
        boolean esAdminGrupo = usuarioComunidadRepository
                .findByComunidadIdComunidadAndUsuarioIdUsuario(id, idUsuarioActual)
                .map(uc -> "admin".equals(uc.getRol()))
                .orElse(false);

        if (esAdminSistema || esAdminGrupo) {
            comunidadRepository.delete(comunidad);
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permisos para eliminar este grupo");
    }

}