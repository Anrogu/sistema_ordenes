package com.metalmod.tornos_produccion.Utils;

import com.metalmod.tornos_produccion.Entity.EntregaParcial;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

public class OrdenVentaCalculos {

    private OrdenVentaCalculos() {}

    public static String calcularEstado(Integer cantidad, Integer cantidadTerminada) {
        if (cantidad == null || cantidad == 0) return "SIN INICIAR";
        if (cantidadTerminada == null || cantidadTerminada == 0) return "SIN INICIAR";
        if (cantidadTerminada >= cantidad) return "COMPLETADA";
        return "EN PROCESO";
    }

    public static Integer calcularPrioridadSistema(LocalDate fechaEntrega) {
        if (fechaEntrega == null) return 4;
        long diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), fechaEntrega);
        if (diasRestantes <= 0) return 1;
        if (diasRestantes <= 3) return 2;
        if (diasRestantes <= 7) return 3;
        return 4;
    }
    public static LocalDate fechaParaPrioridad(LocalDate fechaEntregaPrometida, List<EntregaParcial> entregas) {
        if (entregas != null && !entregas.isEmpty()) {
            return entregas.stream()
                    .map(EntregaParcial::getFechaEntrega)
                    .min(LocalDate::compareTo)
                    .orElse(fechaEntregaPrometida);
        }
        return fechaEntregaPrometida;
    }
}