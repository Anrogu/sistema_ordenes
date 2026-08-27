package com.metalmod.tornos_produccion.Service;

import com.metalmod.tornos_produccion.Entity.Cliente;
import com.metalmod.tornos_produccion.Entity.OrdenVenta;
import com.metalmod.tornos_produccion.Repository.ClienteRepository;
import com.metalmod.tornos_produccion.Repository.OrdenVentaRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Iterator;

@Service
@RequiredArgsConstructor
public class ExcelUploadService {

    private final OrdenVentaRepository ordenVentaRepository;
    private final ClienteRepository clienteRepository;

    @Transactional
    public void procesarPlantillaVentas(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            // Tomamos la primera hoja del Excel
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            // Saltamos la primera fila si es el encabezado
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();

                // Si la celda de ID está vacía, terminamos la lectura
                Cell idCell = row.getCell(0);
                if (idCell == null || idCell.getCellType() == CellType.BLANK) {
                    break;
                }

                String idOrden = getCellValueAsString(idCell);
                String nombreCliente = getCellValueAsString(row.getCell(1));

                // Procesar la fecha de entrega (Columna C)
                java.util.Date dateValue = row.getCell(2).getDateCellValue();
                LocalDate fechaEntrega = dateValue.toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate();

                // Buscamos si el cliente existe, si no, lo creamos
                Cliente cliente = clienteRepository.findByNombre(nombreCliente)
                        .orElseGet(() -> {
                            Cliente nuevoCliente = new Cliente();
                            nuevoCliente.setNombre(nombreCliente);
                            return clienteRepository.save(nuevoCliente);
                        });

                // Buscar la orden existente o crear una nueva
                OrdenVenta orden = ordenVentaRepository.findById(idOrden)
                        .orElse(new OrdenVenta());

                // Si es una orden totalmente nueva, inicializamos sus campos básicos
                if (orden.getIdOrden() == null) {
                    orden.setIdOrden(idOrden);
                    orden.setEstado("PENDIENTE");
                }

                // Actualizamos los datos (el estado manual de prioridadVentas no se toca)
                orden.setCliente(cliente);
                orden.setFechaEntregaPrometida(fechaEntrega);

                // CÁLCULO DE PRIORIDAD DEL SISTEMA (Matemático)
                long diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), fechaEntrega);

                if (diasRestantes <= 0) {
                    orden.setPrioridadSistema(1); // CRÍTICA: Vencida o se entrega hoy
                } else if (diasRestantes <= 3) {
                    orden.setPrioridadSistema(2); // ALTA: Faltan 1 a 3 días
                }
                else if (diasRestantes<= 7){
                    orden.setPrioridadSistema(3); // NORMAL: Faltan más de 3 días
                }else {
                    orden.setPrioridadSistema(4); // BAJA (Azul): Más de una semana
                }

                ordenVentaRepository.save(orden);
            }

        } catch (Exception e) {
            throw new RuntimeException("Error al procesar el archivo Excel: " + e.getMessage());
        }
    }

    // Método auxiliar para evitar errores de tipo de celda
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((int) cell.getNumericCellValue());
            default -> "";
        };
    }
}