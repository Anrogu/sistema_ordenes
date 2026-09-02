package com.metalmod.tornos_produccion.Service;

import com.metalmod.tornos_produccion.Dto.EntregaParcialDto;
import com.metalmod.tornos_produccion.Entity.EntregaParcial;
import com.metalmod.tornos_produccion.Entity.OrdenProduccionDetalle;
import com.metalmod.tornos_produccion.Entity.OrdenVenta;
import com.metalmod.tornos_produccion.Entity.SeguimientoAcp;
import com.metalmod.tornos_produccion.Repository.*;
import com.metalmod.tornos_produccion.Utils.OrdenVentaCalculos;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrdenVentaService {

    private static final Long CLIENTE_PLACEHOLDER_ID = 2L;
    private final EntregaParcialRepository entregaParcialRepository;
    private final OrdenVentaRepository ordenVentaRepository;
    private final OrdenProduccionDetalleRepository detalleRepository;
    private final SeguimientoAcpRepository seguimientoRepository;
    private final ClienteRepository clienteRepository;

    @Transactional
    public List<EntregaParcial> actualizarEntregas(String idOrden, List<EntregaParcialDto> entregasDto) {
        OrdenVenta orden = ordenVentaRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada: " + idOrden));

        int sumaTotal = entregasDto.stream()
                .mapToInt(e -> e.getCantidad() == null ? 0 : e.getCantidad())
                .sum();

        if (sumaTotal != orden.getCantidad()) {
            throw new IllegalArgumentException(
                    "La suma de las entregas (" + sumaTotal + ") debe ser igual a la cantidad total de la orden (" + orden.getCantidad() + ").");
        }

        // Reemplaza el desglose completo (más simple y consistente que ir sumando entregas sueltas)
        entregaParcialRepository.deleteByOrdenVenta_IdOrden(idOrden);

        List<EntregaParcial> nuevas = entregasDto.stream().map(dto -> {
            EntregaParcial e = new EntregaParcial();
            e.setOrdenVenta(orden);
            e.setFechaEntrega(dto.getFechaEntrega());
            e.setCantidad(dto.getCantidad());
            return e;
        }).toList();

        List<EntregaParcial> guardadas = entregaParcialRepository.saveAll(nuevas);

        LocalDate fechaParaPrioridad = OrdenVentaCalculos.fechaParaPrioridad(orden.getFechaEntregaPrometida(), guardadas);
        orden.setPrioridadSistema(OrdenVentaCalculos.calcularPrioridadSistema(fechaParaPrioridad));
        ordenVentaRepository.save(orden);

        return guardadas;
    }

    public List<EntregaParcial> listarEntregas(String idOrden) {
        return entregaParcialRepository.findByOrdenVenta_IdOrdenOrderByFechaEntregaAsc(idOrden);
    }
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

    public List<String> listarOrdenesConMultiplesFechas() {
        return entregaParcialRepository.contarOrdenesConMultiplesEntregas()
                .stream()
                .map(ConteoEntregasProjection::getIdOrden)
                .toList();
    }
}