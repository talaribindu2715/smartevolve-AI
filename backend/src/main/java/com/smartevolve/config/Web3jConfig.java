package com.smartevolve.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

@Slf4j
@Configuration
public class Web3jConfig {

    @Value("${blockchain.rpc-url:http://127.0.0.1:8545}")
    private String rpcUrl;

    @Value("${blockchain.issuer-private-key:0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}")
    private String privateKey;

    @Bean
    public Web3j web3j() {
        try {
            log.info("Connecting to Ethereum/EVM Blockchain RPC: {}", rpcUrl);
            return Web3j.build(new HttpService(rpcUrl));
        } catch (Exception ex) {
            log.warn("Failed to initialize Web3j HTTP client: {}", ex.getMessage());
            return Web3j.build(new HttpService("http://127.0.0.1:8545"));
        }
    }

    @Bean
    public Credentials credentials() {
        try {
            return Credentials.create(privateKey);
        } catch (Exception ex) {
            log.warn("Using fallback local test key: {}", ex.getMessage());
            return Credentials.create("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
        }
    }
}
