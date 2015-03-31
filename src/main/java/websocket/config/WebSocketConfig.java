package websocket.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer {

	@Value("${rabbit.stomp.host}")
	private String host;
	@Value("${rabbit.stomp.port}")
	private String port;

	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		// http://stackoverflow.com/questions/20747283/spring-4-websocket-remote-broker-configuration
		config.enableStompBrokerRelay("/topic/").setRelayHost(host).setRelayPort(Integer.parseInt(port));;
		config.setApplicationDestinationPrefixes("/app");
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint("/quakesep").withSockJS();
	}
}