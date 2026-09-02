package com.metalmod.tornos_produccion.Dto;
import lombok.Data;

@Data
public class AgregarCantidadRequest {
    private String numeroParte;
    private Integer cantidad;
}