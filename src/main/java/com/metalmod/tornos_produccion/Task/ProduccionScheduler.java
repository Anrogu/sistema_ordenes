package com.metalmod.tornos_produccion.Task;

import com.metalmod.tornos_produccion.Entity.OrdenVenta;
import com.metalmod.tornos_produccion.Repository.OrdenVentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ProduccionScheduler {

    private final OrdenVentaRepository ordenVentaRepository;

    // Se ejecuta automáticamente todos los días a la 00:01 AM
    @Scheduled(cron = "0 * * * * *", zone = "America/Mexico_City")
    public void recalcularPrioridadesDiarias() {
        System.out.println("⏳ Iniciando recálculo automático de prioridades...");

        List<OrdenVenta> ordenesActivas = ordenVentaRepository.findAll();
        LocalDate hoy = LocalDate.now();
        int ordenesActualizadas = 0;

        for (OrdenVenta orden : ordenesActivas) {
            // Ignoramos las ya terminadas
            if ("COMPLETADO".equals(orden.getEstado())) continue;

            long diasRestantes = ChronoUnit.DAYS.between(hoy, orden.getFechaEntregaPrometida());

            Integer nuevaPrioridad;
            if (diasRestantes <= 0) nuevaPrioridad = 1;
            else if (diasRestantes <= 3) nuevaPrioridad = 2;
            else nuevaPrioridad = 3;

            // Solo hacemos el UPDATE en base de datos si la prioridad realmente cambió
            if (!nuevaPrioridad.equals(orden.getPrioridadSistema())) {
                orden.setPrioridadSistema(nuevaPrioridad);
                ordenVentaRepository.save(orden);
                ordenesActualizadas++;
            }
        }

        System.out.println("✅ Recálculo terminado. Órdenes actualizadas hoy: " + ordenesActualizadas);
    }
}