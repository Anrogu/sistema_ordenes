package com.metalmod.tornos_produccion.Service;

import com.metalmod.tornos_produccion.Entity.OrdenProduccionDetalle;
import com.metalmod.tornos_produccion.Entity.OrdenVenta;
import com.metalmod.tornos_produccion.Entity.SeguimientoAcp;
import com.metalmod.tornos_produccion.Repository.ClienteRepository;
import com.metalmod.tornos_produccion.Repository.OrdenProduccionDetalleRepository;
import com.metalmod.tornos_produccion.Repository.OrdenVentaRepository;
import com.metalmod.tornos_produccion.Repository.SeguimientoAcpRepository;
import com.metalmod.tornos_produccion.Utils.OrdenVentaCalculos;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrdenVentaService {

    private static final Long CLIENTE_PLACEHOLDER_ID = 2L;

    private final OrdenVentaRepository ordenVentaRepository;
    private final OrdenProduccionDetalleRepository detalleRepository;
    private final SeguimientoAcpRepository seguimientoRepository;
    private final ClienteRepository clienteRepository;

    // 1. Obtener el tablero ordenado para Planeación
    public List<OrdenVenta> obtenerTableroPrioridades() {
        return ordenVentaRepository.findAllByOrderByPrioridadVentasAscPrioridadSistemaAsc();
    }

    // 2. Acción exclusiva de Ventas: Cambiar prioridad manual
    @Transactional
    public OrdenVenta actualizarPrioridadVentas(String idOrden, Integer nuevaPrioridad) {
        OrdenVenta orden = ordenVentaRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada: " + idOrden));

        orden.setPrioridadVentas(nuevaPrioridad);
        return ordenVentaRepository.save(orden);
    }

    // 3. Acción de ACP: Registrar avance de turno
    @Transactional
    public SeguimientoAcp registrarAvanceAcp(Long idDetalle, SeguimientoAcp avance) {
        OrdenProduccionDetalle detalle = detalleRepository.findById(idDetalle)
                .orElseThrow(() -> new RuntimeException("Detalle de producción no encontrado"));

        avance.setOrdenDetalle(detalle);
        SeguimientoAcp reporteGuardado = seguimientoRepository.save(avance);

        detalle.setCantidadFabricada(detalle.getCantidadFabricada() + avance.getPiezasOk());
        detalleRepository.save(detalle);

        return reporteGuardado;
    }

    // 4. Acción de Ventas: sumar cantidad a una pieza
    @Transactional
    public OrdenVenta agregarCantidadPorNumeroParte(String numeroParteRaw, Integer cantidadASumar) {
        if (cantidadASumar == null || cantidadASumar <= 0) {
            throw new IllegalArgumentException("La cantidad a sumar debe ser mayor a 0.");
        }
        String numeroParte = numeroParteRaw.trim().toUpperCase();

        OrdenVenta orden = ordenVentaRepository
                .findFirstByNumeroParteAndEstadoNotOrderByFechaCreacionDesc(numeroParte, "COMPLETADA")
                .orElseGet(() -> {
                    OrdenVenta nueva = new OrdenVenta();
                    nueva.setIdOrden(UUID.randomUUID().toString());
                    nueva.setNumeroOrdenTrabajo("PENDIENTE-" + UUID.randomUUID().toString().substring(0, 8));
                    nueva.setCliente(clienteRepository.getReferenceById(CLIENTE_PLACEHOLDER_ID));
                    nueva.setNumeroParte(numeroParte);
                    nueva.setCantidad(0);
                    nueva.setCantidadTerminada(0);
                    return nueva;
                });

        orden.setCantidad(orden.getCantidad() + cantidadASumar);
        orden.setEstado(OrdenVentaCalculos.calcularEstado(orden.getCantidad(), orden.getCantidadTerminada()));
        orden.setPrioridadSistema(OrdenVentaCalculos.calcularPrioridadSistema(orden.getFechaEntregaPrometida()));

        return ordenVentaRepository.save(orden);
    }

    // 5. Lista de números de parte para el selector del frontend
    public List<String> listarNumerosParte() {
        return ordenVentaRepository.findDistinctNumeroParte();
    }
}