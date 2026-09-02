package com.metalmod.tornos_produccion.Dto;
import lombok.Data;
import java.time.LocalDate;

@Data
public class EntregaParcialDto {
    private LocalDate fechaEntrega;
    private Integer cantidad;
}