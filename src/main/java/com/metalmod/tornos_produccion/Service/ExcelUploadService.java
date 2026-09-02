package com.metalmod.tornos_produccion.Service;

import com.metalmod.tornos_produccion.Entity.Cliente;
import com.metalmod.tornos_produccion.Entity.OrdenVenta;
import com.metalmod.tornos_produccion.Repository.ClienteRepository;
import com.metalmod.tornos_produccion.Repository.OrdenVentaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelUploadService {

    private static final long CLIENTE_PLACEHOLDER_ID = 2L;
    private static final String HEADER_MARKER = "ORDEN DE TRABAJO";

    private final OrdenVentaRepository ordenVentaRepository;
    private final ClienteRepository clienteRepository;

    @Transactional
    public void procesarPlantillaVentas(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            // Hoja de control de ACP = segunda hoja del libro
            Sheet sheet = workbook.getSheetAt(1);

            Cliente clientePlaceholder = clienteRepository.findById(CLIENTE_PLACEHOLDER_ID)
                    .orElseThrow(() -> new RuntimeException(
                            "No existe el cliente placeholder (id=" + CLIENTE_PLACEHOLDER_ID + "). Créalo antes de importar."));

            int headerRowIndex = encontrarFilaEncabezado(sheet);
            if (headerRowIndex == -1) {
                throw new RuntimeException("No se encontró la fila de encabezado ('" + HEADER_MARKER + "') en la hoja.");
            }

            int filasImportadas = 0;
            for (int i = headerRowIndex + 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);

                // Columna B (índice 1) = folio de ACP. Vacío = fin de la tabla.
                Cell folioCell = row == null ? null : row.getCell(1);
                String numeroOrdenTrabajo = getCellValueAsString(folioCell);
                if (numeroOrdenTrabajo.isBlank()) {
                    break;
                }
                final String numeroOrdenTrabajoKey = numeroOrdenTrabajo.trim().toUpperCase();

                String numeroParte = getCellValueAsString(row.getCell(2)).trim().toUpperCase();
                Integer cantidad = getCellValueAsInteger(row.getCell(3));
                Integer cantidadTerminada = getCellValueAsInteger(row.getCell(4));
                LocalDate fechaInicio = getCellValueAsDate(row.getCell(6));
                LocalDate fechaEntrega = getCellValueAsDate(row.getCell(7));

                if (cantidad == null) {
                    log.warn("Orden {} sin CANTIDAD en el Excel — se guarda con cantidad en null.", numeroOrdenTrabajoKey);
                }
                if (numeroParte.isBlank() || cantidad == null) {
                    log.warn("Orden {} incompleta en el Excel (sin número de parte o cantidad) — se omite.", numeroOrdenTrabajoKey);
                    continue;
                }
                OrdenVenta orden = ordenVentaRepository.findByNumeroOrdenTrabajo(numeroOrdenTrabajoKey)
                        .orElseGet(() -> {
                            OrdenVenta nueva = new OrdenVenta();
                            nueva.setIdOrden(UUID.randomUUID().toString());
                            nueva.setNumeroOrdenTrabajo(numeroOrdenTrabajoKey);
                            nueva.setCliente(clientePlaceholder);
                            nueva.setEstado("EN PROCESO");
                            return nueva;
                        });

                orden.setNumeroParte(numeroParte);
                orden.setCantidad(cantidad);
                orden.setCantidadTerminada(cantidadTerminada);

                orden.setFechaInicio(fechaInicio);
                orden.setFechaEntregaPrometida(fechaEntrega);
                orden.setEstado(calcularEstado(cantidad, cantidadTerminada));
                orden.setPrioridadSistema(calcularPrioridadSistema(fechaEntrega));

                ordenVentaRepository.save(orden);
                filasImportadas++;
            }

            log.info("Importación de Excel completada: {} órdenes procesadas.", filasImportadas);

        } catch (Exception e) {
            throw new RuntimeException("Error al procesar el archivo Excel: " + e.getMessage(), e);
        }
    }

    private int encontrarFilaEncabezado(Sheet sheet) {
        for (int i = 0; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            String valorColumnaB = getCellValueAsString(row.getCell(1)).trim();
            if (valorColumnaB.equalsIgnoreCase(HEADER_MARKER)) {
                return i;
            }
        }
        return -1;
    }

    private String calcularEstado(Integer cantidad, Integer cantidadTerminada) {
        if (cantidad == null || cantidad == 0) return "SIN INICIAR";
        if (cantidadTerminada == null || cantidadTerminada == 0) return "SIN INICIAR";
        if (cantidadTerminada >= cantidad) return "COMPLETADA";
        return "EN PROCESO";
    }

    private Integer calcularPrioridadSistema(LocalDate fechaEntrega) {
        if (fechaEntrega == null) return 4;
        long diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), fechaEntrega);
        if (diasRestantes <= 0) return 1;      // CRÍTICA
        if (diasRestantes <= 3) return 2;      // ALTA
        if (diasRestantes <= 7) return 3;      // NORMAL
        return 4;                              // BAJA
    }

    // --- MÉTODOS AUXILIARES BLINDADOS CONTRA CELDAS ROTAS DE EXCEL ---

    private String getCellValueAsString(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.ERROR) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }

    private Integer getCellValueAsInteger(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.ERROR || cell.getCellType() == CellType.BLANK) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        }
        if (cell.getCellType() == CellType.STRING) {
            try {
                return Integer.parseInt(cell.getStringCellValue().trim());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private LocalDate getCellValueAsDate(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.ERROR || cell.getCellType() == CellType.BLANK) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
        return null;
    }
}