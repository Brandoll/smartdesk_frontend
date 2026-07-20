import { HttpInterceptorFn, HttpResponse, HttpRequest } from '@angular/common/http';
import { of, delay } from 'rxjs';

export const mockInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next) => {
  // Allow authentication to hit the real backend
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Parse URL to identify the resource
  const urlObj = new URL(req.url, 'http://localhost');
  const path = urlObj.pathname;

  console.log(`[Mock Interceptor] Intercepted ${req.method} ${path}`);

  // Helper to generate UUIDs
  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

  // Storage access
  const getStorage = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
  const setStorage = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  // -------- AREAS MOCK --------
  if (path.match(new RegExp('/areas/?$'))) {
    let areas = getStorage('mock_areas');
    
    // Seed areas if empty
    if (areas.length === 0 && req.method === 'GET') {
      areas = [
        { id: generateId(), name: 'Soporte Técnico', description: 'Problemas de hardware y software' },
        { id: generateId(), name: 'Infraestructura', description: 'Redes y servidores' },
        { id: generateId(), name: 'Recursos Humanos', description: 'Consultas de personal' }
      ];
      setStorage('mock_areas', areas);
    }

    if (req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: areas })).pipe(delay(300));
    }
    
    if (req.method === 'POST') {
      const newArea = { ...req.body as any, id: generateId() };
      areas.push(newArea);
      setStorage('mock_areas', areas);
      return of(new HttpResponse({ status: 200, body: newArea })).pipe(delay(400));
    }
  }

  // -------- USERS MOCK --------
  if (path.match(new RegExp('/users/?$'))) {
    let users = getStorage('mock_users');

    if (req.method === 'GET') {
      const pageInfo = {
        content: users,
        totalElements: users.length,
        totalPages: 1,
        number: 0,
        size: 10
      };
      return of(new HttpResponse({ status: 200, body: pageInfo })).pipe(delay(300));
    }

    if (req.method === 'POST') {
      const newUser = { ...req.body as any, id: generateId(), status: 'ACTIVO' };
      users.push(newUser);
      setStorage('mock_users', users);
      return of(new HttpResponse({ status: 200, body: newUser })).pipe(delay(400));
    }
  }

  // -------- TICKETS MOCK --------
  if (path.match(new RegExp('/tickets/?$'))) {
    let tickets = getStorage('mock_tickets');

    if (req.method === 'GET') {
      const pageInfo = {
        content: tickets.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        totalElements: tickets.length,
        totalPages: 1,
        number: 0,
        size: 10
      };
      return of(new HttpResponse({ status: 200, body: pageInfo })).pipe(delay(400));
    }

    if (req.method === 'POST') {
      const body = req.body as any;
      const areas = getStorage('mock_areas');
      
      const newTicket = {
        ...body,
        id: generateId(),
        status: 'ABIERTO',
        createdAt: new Date().toISOString(),
        aiClassified: true,
        aiSuggestedTitle: `Resumen: ${body.title}`,
        aiSuggestedPriority: body.priority || 'MEDIA',
        aiSuggestedAreaId: body.areaId || (areas.length > 0 ? areas[0].id : null),
        aiSuggestedSolution: 'Esta es una solución automática generada por la IA simulada. Te recomendamos revisar las configuraciones del sistema o contactar al administrador para aplicar un parche rápido.',
      };
      
      // If no area was selected, assign the AI suggested one
      if (!newTicket.areaId) {
        newTicket.areaId = newTicket.aiSuggestedAreaId;
      }

      tickets.push(newTicket);
      setStorage('mock_tickets', tickets);
      
      // Add initial history
      const history = getStorage('mock_history');
      history.push({
        ticketId: newTicket.id,
        eventType: 'TICKET_CREATED',
        newValue: 'Ticket creado',
        timestamp: new Date().toISOString()
      });
      setStorage('mock_history', history);

      return of(new HttpResponse({ status: 200, body: newTicket })).pipe(delay(600));
    }
  }

  // -------- TICKET BY ID --------
  const ticketIdMatch = path.match(new RegExp('/tickets/([a-zA-Z0-9\\\\-]+)$'));
  if (ticketIdMatch && req.method === 'GET') {
    const id = ticketIdMatch[1];
    const tickets = getStorage('mock_tickets');
    const ticket = tickets.find((t: any) => t.id === id);
    if (ticket) {
      return of(new HttpResponse({ status: 200, body: ticket })).pipe(delay(200));
    }
  }
  
  if (ticketIdMatch && req.method === 'PUT') {
    const id = ticketIdMatch[1];
    let tickets = getStorage('mock_tickets');
    const index = tickets.findIndex((t: any) => t.id === id);
    if (index !== -1) {
      tickets[index] = { ...tickets[index], ...(req.body as any) };
      setStorage('mock_tickets', tickets);
      return of(new HttpResponse({ status: 200, body: tickets[index] })).pipe(delay(300));
    }
  }

  // -------- TICKET MESSAGES --------
  const msgMatch = path.match(new RegExp('/tickets/([a-zA-Z0-9\\\\-]+)/messages'));
  if (msgMatch) {
    const id = msgMatch[1];
    let messages = getStorage('mock_messages');
    
    if (req.method === 'GET') {
      const ticketMsgs = messages.filter((m: any) => m.ticketId === id);
      return of(new HttpResponse({ status: 200, body: ticketMsgs })).pipe(delay(200));
    }
    
    if (req.method === 'POST') {
      const body = req.body as any;
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const newMsg = {
        id: generateId(),
        ticketId: id,
        senderId: currentUser.id,
        senderName: currentUser.name || 'Usuario Local',
        message: body.message,
        isInternal: body.isInternal || false,
        createdAt: new Date().toISOString()
      };
      messages.push(newMsg);
      setStorage('mock_messages', messages);
      return of(new HttpResponse({ status: 200, body: newMsg })).pipe(delay(300));
    }
  }

  // -------- TICKET HISTORY --------
  const histMatch = path.match(new RegExp('/tickets/([a-zA-Z0-9\\\\-]+)/history'));
  if (histMatch && req.method === 'GET') {
    const id = histMatch[1];
    const history = getStorage('mock_history');
    const ticketHist = history.filter((h: any) => h.ticketId === id);
    return of(new HttpResponse({ status: 200, body: ticketHist })).pipe(delay(200));
  }

  // -------- DASHBOARD METRICS --------
  if (path.includes('/dashboard/metrics') && req.method === 'GET') {
    const tickets = getStorage('mock_tickets');
    const users = getStorage('mock_users');
    const areas = getStorage('mock_areas');

    const metrics = {
      totalTickets: tickets.length,
      openTickets: tickets.filter((t: any) => t.status === 'ABIERTO').length,
      resolvedTickets: tickets.filter((t: any) => t.status === 'RESUELTO').length,
      highPriority: tickets.filter((t: any) => t.priority === 'ALTA' || t.priority === 'CRITICA').length,
      totalUsers: users.length,
      totalAreas: areas.length
    };
    return of(new HttpResponse({ status: 200, body: metrics })).pipe(delay(400));
  }

  // If nothing matched, just pass it through
  return next(req);
};
