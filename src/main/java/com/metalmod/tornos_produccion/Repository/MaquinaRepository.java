package com.metalmod.tornos_produccion.Repository;

import com.metalmod.tornos_produccion.Entity.Maquina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaquinaRepository extends JpaRepository<Maquina, Long> {
}