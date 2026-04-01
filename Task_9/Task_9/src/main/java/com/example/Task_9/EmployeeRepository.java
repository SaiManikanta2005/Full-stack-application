package com.example.Task_9;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class EmployeeRepository {

    // In-memory employee data
    private final Map<Integer, Employee> store = Map.of(
            101, new Employee(101, "Anand", "CSE"),
            102, new Employee(102, "Divya", "ECE"),
            103, new Employee(103, "Ravi", "IT")
    );

    public Employee findById(int id) {
        return store.get(id);
    }
}