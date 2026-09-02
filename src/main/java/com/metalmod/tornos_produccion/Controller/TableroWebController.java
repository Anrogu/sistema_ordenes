package com.metalmod.tornos_produccion.Controller;

import com.metalmod.tornos_produccion.Entity.OrdenVenta;
import com.metalmod.tornos_produccion.Service.OrdenVentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tablero")
@RequiredArgsConstructor
public class TableroWebController {

    private final OrdenVentaService ordenVentaService;

    @GetMapping("/datos")
    public ResponseEntity<Map<String, Object>> obtenerDatosTablero() {
        List<OrdenVenta> ordenes = ordenVentaService.obtenerTableroPrioridades();

        Map<String, Object> response = new HashMap<>();
        response.put("ordenes", ordenes);
        response.put("totalOrdenes", ordenes.size());

        List<OrdenVenta> top10Urgentes = ordenes.stream()
                .sorted(Comparator.comparing(OrdenVenta::getPrioridadFinal)
                        .thenComparing(OrdenVenta::getFechaEntregaPrometida, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(10)
                .collect(Collectors.toList());
        response.put("top10", top10Urgentes);

        // NUEVO: ids de órdenes con más de una fecha de entrega
        response.put("ordenesConMultiplesFechas", ordenVentaService.listarOrdenesConMultiplesFechas());

        return ResponseEntity.ok(response);
    }
}