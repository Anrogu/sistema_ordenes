package com.metalmod.tornos_produccion.Controller;

import com.metalmod.tornos_produccion.Entity.OrdenVenta;
import com.metalmod.tornos_produccion.Entity.SeguimientoAcp;
import com.metalmod.tornos_produccion.Service.OrdenVentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenVentaController {

    private final OrdenVentaService ordenVentaService;

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

}