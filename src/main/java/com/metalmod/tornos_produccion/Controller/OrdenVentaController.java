package com.metalmod.tornos_produccion.Controller;

import com.metalmod.tornos_produccion.Dto.AgregarCantidadRequest;
import com.metalmod.tornos_produccion.Entity.OrdenVenta;
import com.metalmod.tornos_produccion.Entity.SeguimientoAcp;
import com.metalmod.tornos_produccion.Service.ExcelUploadService;
import com.metalmod.tornos_produccion.Service.OrdenVentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenVentaController {
    private final OrdenVentaService ordenVentaService;
    private final ExcelUploadService excelUploadService;


    // Endpoint para Planeación: Ver el tablero de atrasos
    @GetMapping("/tablero")
    public ResponseEntity<List<OrdenVenta>> obtenerTablero() {
        return ResponseEntity.ok(ordenVentaService.obtenerTableroPrioridades());
    }
    // Endpoint para Ventas: Ajustar urgencia
    @PutMapping("/{idOrden}/prioridad")
    public ResponseEntity<OrdenVenta> cambiarPrioridad(
            @PathVariable String idOrden,
            // Agregamos required = false para aceptar nulos (modo Automático)
            @RequestParam(required = false) Integer nivel) {

        OrdenVenta ordenActualizada = ordenVentaService.actualizarPrioridadVentas(idOrden, nivel);
        return ResponseEntity.ok(ordenActualizada);
    }

    // Endpoint para ACP: Reportar avance de piezas en un turno
    @PostMapping("/detalle/{idDetalle}/avance")
    public ResponseEntity<SeguimientoAcp> reportarAvance(
            @PathVariable Long idDetalle,
            @RequestBody SeguimientoAcp avance) {

        SeguimientoAcp nuevoAvance = ordenVentaService.registrarAvanceAcp(idDetalle, avance);
        return ResponseEntity.ok(nuevoAvance);
    }
    @PostMapping("/upload-excel")
    public ResponseEntity<String> cargarExcelVentas(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("El archivo está vacío");
        }

        try {
            // Llamamos al servicio que acabamos de crear
            excelUploadService.procesarPlantillaVentas(file);
            return ResponseEntity.ok("Archivo procesado y base de datos actualizada exitosamente.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al subir el archivo: " + e.getMessage());
        }
    }
    // GET: lista de números de parte para el selector
    @GetMapping("/partes")
    @PreAuthorize("hasRole('VENTAS')")
    public ResponseEntity<List<String>> listarPartes() {
        return ResponseEntity.ok(ordenVentaService.listarNumerosParte());
    }

    // POST: sumar cantidad a una pieza (crea orden si no hay una abierta)
    @PostMapping("/ventas/agregar-cantidad")
    @PreAuthorize("hasRole('VENTAS')")
    public ResponseEntity<OrdenVenta> agregarCantidad(@RequestBody AgregarCantidadRequest request) {
        OrdenVenta orden = ordenVentaService.agregarCantidadPorNumeroParte(
                request.getNumeroParte(), request.getCantidad());
        return ResponseEntity.ok(orden);
    }

}