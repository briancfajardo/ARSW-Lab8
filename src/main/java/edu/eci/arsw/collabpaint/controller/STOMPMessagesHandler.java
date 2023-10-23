package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Collections;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    private final ConcurrentHashMap<String, ConcurrentLinkedDeque<Point>>  polygons = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);

        if (!polygons.containsKey(numdibujo)) {
            ConcurrentLinkedDeque<Point> points = new ConcurrentLinkedDeque<>(Collections.singletonList(pt));
            polygons.put(numdibujo, points);
        } else {
            polygons.get(numdibujo).add(pt);
        }
        if (polygons.get(numdibujo).size() == 4) {
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygons.get(numdibujo));
            polygons.remove(numdibujo);
        }

        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
    }
}