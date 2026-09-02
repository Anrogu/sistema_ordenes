package com.metalmod.tornos_produccion.Dto;
import lombok.Data;
import java.util.List;

@Data
public class ActualizarEntregasRequest {
    private List<EntregaParcialDto> entregas;
}