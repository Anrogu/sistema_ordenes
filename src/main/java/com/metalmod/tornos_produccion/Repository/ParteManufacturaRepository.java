package com.metalmod.tornos_produccion.Repository;

import com.metalmod.tornos_produccion.Entity.ParteManufactura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParteManufacturaRepository extends JpaRepository<ParteManufactura, Long> {
}