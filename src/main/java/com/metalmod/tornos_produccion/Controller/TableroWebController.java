package com.metalmod.tornos_produccion.Controller;

import com.metalmod.tornos_produccion.Entity.OrdenVenta;
import com.metalmod.tornos_produccion.Service.OrdenVentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class TableroWebController {

    private final OrdenVentaService ordenVentaService;

    @GetMapping("/web/tablero")
    public String mostrarTableroWeb(Model model) {
        List<OrdenVenta> ordenes = ordenVentaService.obtenerTableroPrioridades();

        // Pasamos la lista completa a la vista
        model.addAttribute("ordenes", ordenes);

        // Calculamos algunos KPIs para las gráficas y tarjetas
        long totalOrdenes = ordenes.size();
        long ordenesCriticas = ordenes.stream()
                .filter(o -> (o.getPrioridadVentas() != null && o.getPrioridadVentas() <= 1)
                        || (o.getPrioridadSistema() <= 1))
                .count();
        long ordenesPendientes = totalOrdenes - ordenesCriticas;

        model.addAttribute("totalOrdenes", totalOrdenes);
        model.addAttribute("ordenesCriticas", ordenesCriticas);
        model.addAttribute("ordenesPendientes", ordenesPendientes);

        // Retorna el archivo tablero.html que crearemos a continuación
        return "tablero";
    }
}