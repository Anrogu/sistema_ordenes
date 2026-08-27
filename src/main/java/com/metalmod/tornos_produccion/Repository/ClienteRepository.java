package com.metalmod.tornos_produccion.Repository;
import com.metalmod.tornos_produccion.Entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // Spring Boot leerá este nombre y creará un "SELECT * FROM clientes WHERE nombre = ?"
    Optional<Cliente> findByNombre(String nombre);
}