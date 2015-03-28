package standalone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@ComponentScan
@EnableAutoConfiguration
@ImportResource("classpath:spring.xml")
public class Main {

	public static void main(String[] args) {
		SpringApplication.run(Main.class, args);
	}
}
