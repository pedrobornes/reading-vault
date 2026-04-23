package com.readingvault.security;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // Llave secreta para firmar los tokens
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // El token durará 24 horas
    private final long EXPIRATION_TIME = 86400000;

    // Generar el token
    public String generateToken(String email) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    // Extraer el email del token
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Validar si el token ha expirado
    public boolean isTokenValid(String token, String email) {
        final String userEmail = extractEmail(token);
        return (userEmail.equals(email) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}