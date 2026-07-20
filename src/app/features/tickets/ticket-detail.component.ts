import { Component, OnInit, inject, signal, computed, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../core/services/ticket.service';
import { AreaService } from '../../core/services/area.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppStateService } from '../../core/state/app-state.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { AudioNotificationService } from '../../core/services/audio-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="detail-page">
      @if (loading()) {
        <div class="skeleton-layout">
          <div class="skeleton-left"></div>
          <div class="skeleton-right"></div>
        </div>
      } @else if (ticket()) {
        <div class="detail-layout">
          <!-- ===================== LEFT COLUMN: Conversation ===================== -->
          <div class="conversation-column">
            <!-- Ticket Header -->
            <div class="ticket-header">
              <div class="ticket-id-row">
                <button class="btn-back" (click)="goBack()">
                  <span class="material-symbols-outlined">arrow_back</span>
                </button>
                <span class="ticket-id-badge">SD-{{ ticket().id?.toString().substring(0,4) }}</span>
                <span class="created-at">• {{ ticket().createdAt | date:'short' || 'Creado hace poco' }}</span>
              </div>
              <h2 class="ticket-title">{{ ticket().title }}</h2>
              <div class="ticket-meta">
                <div class="shared-avatars">
                  <div class="shared-avatar">{{ getInitials(ticket().createdByName) }}</div>
                </div>
                <span class="shared-text">
                  {{ ticket().createdByName || 'Creador' }}
                  @if (ticket().assignedToName) {
                    <span> · Asignado a {{ ticket().assignedToName }}</span>
                  }
                </span>
              </div>
            </div>

            <!-- Chat Messages -->
            <div class="chat-feed" #chatContainer>
              @for (msg of messages(); track msg.id) {
                @if (msg.type === 'internal') {
                  <!-- Internal Note (right-aligned dark) -->
                  <div class="message-row message-internal">
                    <div class="message-body-internal">
                      <div class="message-meta-right">
                        <span class="msg-time">{{ msg.time }}</span>
                        <span class="internal-label">Internal Note</span>
                        <span class="material-symbols-outlined" style="font-size:16px; color:var(--primary,#1b1b1b)" >lock</span>
                      </div>
                      <div class="bubble-internal">{{ msg.text }}</div>
                    </div>
                  </div>
                } @else if (msg.type === 'file') {
                  <!-- File Attachment -->
                  <div class="message-row">
                    <div class="file-attachment">
                      <div class="file-icon">
                        <span class="material-symbols-outlined" style="font-size:28px">description</span>
                      </div>
                      <div class="file-info">
                        <p class="file-name">{{ msg.fileName }}</p>
                        <p class="file-meta">{{ msg.fileSize }}</p>
                      </div>
                      <span class="material-symbols-outlined download-icon">download</span>
                    </div>
                  </div>
                } @else {
                  <!-- Regular Message -->
                  <div class="message-row" [class.mine]="msg.isMe">
                    @if (!msg.isMe) {
                      <div class="msg-avatar">{{ getInitials(msg.userName) }}</div>
                    }
                    <div class="message-body">
                      <div class="message-meta">
                        <span class="msg-author">{{ msg.userName }}</span>
                        <span class="msg-time">{{ msg.time }}</span>
                      </div>
                      <div class="bubble" [class.bubble-mine]="msg.isMe">{{ msg.text }}</div>
                    </div>
                    @if (msg.isMe) {
                      <div class="msg-avatar">{{ getInitials(msg.userName) }}</div>
                    }
                  </div>
                }
              }
            </div>

            <!-- Reply Input -->
            <div class="reply-area">
              <div class="reply-box" [class.focused]="replyFocused">
                <!-- Tabs -->
                <div class="reply-tabs">
                  <button class="reply-tab" [class.active]="replyMode === 'reply'" (click)="replyMode = 'reply'">Reply</button>
                  <button class="reply-tab" [class.active]="replyMode === 'internal'" (click)="replyMode = 'internal'">Internal Note</button>
                  <div class="tab-spacer"></div>
                  <div class="format-actions">
                    <button class="format-btn"><span class="material-symbols-outlined">format_bold</span></button>
                    <button class="format-btn"><span class="material-symbols-outlined">format_italic</span></button>
                    <button class="format-btn"><span class="material-symbols-outlined">link</span></button>
                  </div>
                </div>

                <!-- Text area -->
                <textarea
                  class="reply-input"
                  [(ngModel)]="replyText"
                  placeholder="Type your message here..."
                  (focus)="replyFocused = true"
                  (blur)="replyFocused = false"
                  rows="4"></textarea>

                <!-- Bottom actions -->
                <div class="reply-footer">
                  <div class="reply-attach">
                    <button class="attach-btn"><span class="material-symbols-outlined">attach_file</span></button>
                    <button class="attach-btn"><span class="material-symbols-outlined">alternate_email</span></button>
                  </div>
                  <div class="reply-send">
                    <button class="btn-discard" (click)="replyText = ''">Discard</button>
                    <button class="btn-send-response" (click)="sendMessage()" [disabled]="!replyText.trim()">
                      Send Response
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ===================== RIGHT COLUMN: Sidebar ===================== -->
          <div class="sidebar-column">
            <!-- AI Insights -->
            <div class="sidebar-section">
              <div class="ai-insights-card">
                <div class="ai-insights-header">
                  <div class="ai-insights-title">
                    <span class="material-symbols-outlined" style="font-size:20px; font-variation-settings:'FILL' 1">auto_awesome</span>
                    <span class="insights-label">AI INSIGHTS</span>
                  </div>
                  <span class="material-symbols-outlined" style="font-size:18px; color:var(--outline,#7e7576)">info</span>
                </div>
                <div class="insights-body">
                  <div class="insights-row">
                    <p class="insights-sub-label">CLASSIFICATION LOGIC</p>
                    <p class="insights-text">
                      Identified <u>{{ getAICategory() }}</u> pattern in logs.
                      High correlation with <strong>{{ getAIKeyword() }}</strong> issues.
                    </p>
                  </div>
                  <div class="confidence-row">
                    <span>Confidence</span>
                    <span class="confidence-value">98.4%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status -->
            <div class="sidebar-section meta-section">
              <div class="meta-group">
                <label class="meta-label">STATUS</label>
                <div class="select-wrapper">
                  <select class="meta-select" [ngModel]="ticket().status" (ngModelChange)="updateStatus($event)">
                    <option value="ABIERTO">Abierto</option>
                    <option value="ASIGNADO">Asignado</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="PROPUESTO">Propuesto</option>
                    <option value="RESUELTO">Resuelto</option>
                    <option value="CERRADO">Cerrado</option>
                  </select>
                  <span class="material-symbols-outlined select-arrow">expand_more</span>
                </div>
              </div>

              <!-- Priority + Area Grid -->
              <div class="meta-grid">
                <div class="meta-group">
                  <label class="meta-label">PRIORITY</label>
                  <div class="priority-tag" [attr.data-priority]="ticket().priority">
                    <span class="material-symbols-outlined" style="font-size:16px; font-variation-settings:'FILL' 1">priority_high</span>
                    {{ getPriorityLabel(ticket().priority) }}
                  </div>
                </div>
                <div class="meta-group">
                  <label class="meta-label">AREA</label>
                  <div class="select-wrapper">
                    <select class="meta-select" [ngModel]="ticket().areaId || ''" (ngModelChange)="updateArea($event)">
                      <option value="">Sin Área</option>
                      @for (area of areas(); track area.id) {
                        <option [value]="area.id">{{ area.name }}</option>
                      }
                    </select>
                    <span class="material-symbols-outlined select-arrow">expand_more</span>
                  </div>
                </div>
              </div>

              <!-- Assignee -->
              <div class="meta-group">
                <label class="meta-label">ASSIGNEE</label>
                <div class="select-wrapper">
                  <select class="meta-select" [ngModel]="ticket().assignedToId || ''" (ngModelChange)="updateAssignee($event)">
                    <option value="">Sin asignar</option>
                    @for (user of users(); track user.id) {
                      <option [value]="user.id">{{ user.name }}</option>
                    }
                  </select>
                  <span class="material-symbols-outlined select-arrow">expand_more</span>
                </div>
              </div>

              <!-- SLA Countdown -->
              <div class="sla-card">
                <div class="sla-header">
                  <span class="sla-label">SLA COUNTDOWN</span>
                  <span class="sla-status-badge">ACTIVE</span>
                </div>
                <div class="sla-time">{{ slaTime }}</div>
                <div class="sla-bar">
                  <div class="sla-progress" [style.width]="slaPercent + '%'"></div>
                </div>
              </div>
            </div>

            <!-- Ticket History -->
            <div class="sidebar-section">
              <div class="history-panel">
                <h3 class="history-title">
                  <span class="material-symbols-outlined" style="font-size:18px">history</span>
                  Ticket History
                </h3>
                <div class="history-timeline">
                  @for (event of historyEvents(); track event.id) {
                    <div class="history-item" [class.active]="event.active">
                      <div class="history-dot" [class.active]="event.active">
                        @if (event.active) { <div class="dot-inner"></div> }
                      </div>
                      <div class="history-content">
                        <p class="history-text" [innerHTML]="event.text"></p>
                        <p class="history-meta">{{ event.by }} • {{ event.time }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 80px); overflow: hidden; }

    .detail-page { height: 100%; }

    /* Layout */
    .detail-layout {
      display: grid; grid-template-columns: 1fr 300px;
      height: 100%; overflow: hidden;
    }

    /* ========== LEFT: Conversation ========== */
    .conversation-column {
      display: flex; flex-direction: column; height: 100%;
      overflow: hidden; background: white;
    }

    .ticket-header {
      padding: 28px 32px; border-bottom: 1px solid var(--outline-variant, #cfc4c5);
      background: white; flex-shrink: 0;
    }

    .ticket-id-row {
      display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
    }
    .btn-back {
      width: 30px; height: 30px; border-radius: 8px;
      border: 1px solid var(--outline-variant, #cfc4c5); background: transparent;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--on-surface, #1a1b22); transition: background 0.15s;
    }
    .btn-back:hover { background: var(--surface-container-low, #f4f2fd); }
    .ticket-id-badge {
      padding: 3px 12px; background: var(--surface-container, #eeedf7);
      border-radius: 9999px; font-family: 'Geist', sans-serif;
      font-size: 12px; font-weight: 700; color: var(--primary, #1b1b1b);
    }
    .created-at { font-size: 12px; color: var(--outline, #7e7576); }

    .ticket-title {
      font-family: 'Geist', sans-serif; font-size: 22px;
      font-weight: 700; letter-spacing: -0.01em;
      color: var(--on-surface, #1a1b22); margin-bottom: 14px; line-height: 1.3;
    }

    .ticket-meta { display: flex; align-items: center; gap: 10px; }
    .shared-avatars { display: flex; }
    .shared-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--surface-container-highest, #e3e1ec);
      border: 2px solid white; display: flex; align-items: center; justify-content: center;
      font-family: 'Geist', sans-serif; font-size: 10px; font-weight: 700;
    }
    .shared-text { font-size: 13px; color: var(--on-surface-variant, #4c4546); }

    /* Chat Feed */
    .chat-feed {
      flex: 1; overflow-y: auto; padding: 28px 32px;
      display: flex; flex-direction: column; gap: 28px;
      background: rgba(251,248,255,0.5);
    }
    .chat-feed::-webkit-scrollbar { width: 4px; }
    .chat-feed::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 9999px; }

    .message-row { display: flex; gap: 14px; align-items: flex-start; }
    .message-row.mine { flex-direction: row-reverse; }

    .msg-avatar {
      width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
      background: var(--surface-container-highest, #e3e1ec);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 700;
    }

    .message-body { flex: 1; max-width: 75%; }
    .message-meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
    .msg-author { font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 700; }
    .msg-time { font-size: 10px; color: var(--outline, #7e7576); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

    .bubble {
      padding: 14px 16px; background: white;
      border: 1px solid var(--outline-variant, #cfc4c5); border-radius: 12px;
      font-size: 14px; line-height: 1.5; color: var(--on-surface, #1a1b22);
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .bubble-mine {
      background: var(--primary, #1b1b1b); color: white; border-color: transparent;
    }

    /* Internal Note */
    .message-internal { flex-direction: row-reverse; }
    .message-body-internal { display: flex; flex-direction: column; align-items: flex-end; max-width: 75%; }
    .message-meta-right {
      display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
    }
    .internal-label { font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 700; color: var(--primary, #1b1b1b); }
    .bubble-internal {
      padding: 14px 16px; background: #1b1b1b;
      border: 1px solid var(--primary, #1b1b1b); border-radius: 12px;
      font-size: 14px; line-height: 1.5; color: white; font-style: italic; opacity: 0.9;
    }

    /* File Attachment */
    .file-attachment {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px; background: white;
      border: 1px solid var(--outline-variant, #cfc4c5); border-radius: 12px;
      max-width: 280px; cursor: pointer; transition: border-color 0.2s;
    }
    .file-attachment:hover { border-color: var(--primary, #1b1b1b); }
    .file-icon {
      width: 44px; height: 44px; border-radius: 10px;
      background: var(--surface-container, #eeedf7); display: flex; align-items: center; justify-content: center;
      color: var(--primary, #1b1b1b);
    }
    .file-info { flex: 1; min-width: 0; }
    .file-name { font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .file-meta { font-size: 11px; color: var(--outline, #7e7576); }
    .download-icon { color: var(--outline, #7e7576); transition: color 0.2s; }
    .file-attachment:hover .download-icon { color: var(--primary, #1b1b1b); }

    /* Reply Area */
    .reply-area { padding: 20px 28px; border-top: 1px solid var(--outline-variant, #cfc4c5); background: white; flex-shrink: 0; }
    .reply-box {
      border: 1px solid var(--outline-variant, #cfc4c5); border-radius: 12px;
      overflow: hidden; transition: border-color 0.2s;
    }
    .reply-box.focused { border-color: rgba(27,27,27,0.4); }

    .reply-tabs {
      display: flex; align-items: center; gap: 4px;
      padding: 10px 14px; border-bottom: 1px solid var(--outline-variant, #cfc4c5);
      background: white;
    }
    .reply-tab {
      padding: 6px 16px; border: none; background: transparent; border-radius: 9999px;
      font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 700;
      color: var(--on-surface-variant, #4c4546); cursor: pointer; transition: all 0.15s;
    }
    .reply-tab.active { color: var(--primary, #1b1b1b); background: rgba(27,27,27,0.05); }
    .tab-spacer { flex: 1; }
    .format-actions { display: flex; gap: 2px; }
    .format-btn {
      width: 30px; height: 30px; border: none; background: transparent;
      border-radius: 6px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--outline, #7e7576); transition: all 0.15s;
    }
    .format-btn:hover { background: var(--surface-container, #eeedf7); color: var(--on-surface, #1a1b22); }
    .format-btn .material-symbols-outlined { font-size: 18px; }

    .reply-input {
      width: 100%; padding: 16px 18px; border: none; outline: none;
      resize: none; font-family: 'Manrope', sans-serif; font-size: 14px;
      color: var(--on-surface, #1a1b22); background: white; line-height: 1.5;
    }
    .reply-input::placeholder { color: var(--outline, #7e7576); }

    .reply-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px; border-top: 1px solid var(--outline-variant, #cfc4c5);
      background: white;
    }
    .reply-attach { display: flex; gap: 4px; }
    .attach-btn {
      width: 32px; height: 32px; border: none; background: transparent;
      border-radius: 6px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--outline, #7e7576); transition: color 0.15s;
    }
    .attach-btn:hover { color: var(--on-surface, #1a1b22); }
    .attach-btn .material-symbols-outlined { font-size: 20px; }
    .reply-send { display: flex; align-items: center; gap: 8px; }
    .btn-discard {
      padding: 8px 16px; background: transparent; border: none; border-radius: 9999px;
      font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 600;
      color: var(--on-surface-variant, #4c4546); cursor: pointer; transition: background 0.15s;
    }
    .btn-discard:hover { background: var(--surface-container-low, #f4f2fd); }
    .btn-send-response {
      padding: 8px 20px; background: var(--primary, #1b1b1b); color: white;
      border: none; border-radius: 9999px;
      font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 700;
      cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: all 0.15s;
    }
    .btn-send-response:hover:not(:disabled) { opacity: 0.9; }
    .btn-send-response:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ========== RIGHT: Sidebar ========== */
    .sidebar-column {
      display: flex; flex-direction: column; overflow-y: auto;
      background: var(--surface, #fbf8ff);
      border-left: 1px solid var(--outline-variant, #cfc4c5);
    }
    .sidebar-column::-webkit-scrollbar { width: 4px; }
    .sidebar-column::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 9999px; }

    .sidebar-section { padding: 20px; border-bottom: 1px solid var(--outline-variant, #cfc4c5); }
    .sidebar-section:last-child { border-bottom: none; }

    /* AI Insights */
    .ai-insights-card {
      border: 1.5px solid #1a1b22; border-radius: 12px;
      padding: 16px; background: white;
    }
    .ai-insights-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;
    }
    .ai-insights-title { display: flex; align-items: center; gap: 8px; }
    .insights-label {
      font-family: 'Geist', sans-serif; font-size: 10px;
      font-weight: 700; letter-spacing: 0.15em; color: var(--primary, #1b1b1b);
    }
    .insights-body { display: flex; flex-direction: column; gap: 12px; }
    .insights-sub-label {
      font-family: 'Geist', sans-serif; font-size: 9px;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
      color: var(--outline, #7e7576); margin-bottom: 4px; opacity: 0.7;
    }
    .insights-text { font-size: 13px; color: var(--on-surface, #1a1b22); line-height: 1.5; font-weight: 500; }
    .confidence-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 12px; background: var(--surface-container-low, #f4f2fd);
      border: 1px solid var(--outline-variant, #cfc4c5); border-radius: 8px;
      font-size: 12px;
    }
    .confidence-value { font-weight: 700; color: var(--primary, #1b1b1b); }

    /* Meta Section */
    .meta-section { display: flex; flex-direction: column; gap: 16px; }
    .meta-label {
      display: block; font-family: 'Geist', sans-serif; font-size: 10px;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
      color: var(--on-surface-variant, #4c4546); margin-bottom: 6px;
    }
    .meta-group {}
    .select-wrapper { position: relative; }
    .meta-select {
      width: 100%; padding: 10px 36px 10px 14px; appearance: none;
      background: white; border: 1px solid var(--outline-variant, #cfc4c5);
      border-radius: 9999px; font-family: 'Geist', sans-serif; font-size: 13px;
      color: var(--on-surface, #1a1b22); outline: none; cursor: pointer; transition: border-color 0.2s;
    }
    .meta-select:focus { border-color: var(--primary, #1b1b1b); }
    .select-arrow {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      pointer-events: none; color: var(--outline, #7e7576);
    }

    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .priority-tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 6px 12px; border-radius: 9999px;
      font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 700;
      background: rgba(186, 26, 26, 0.1); color: #ba1a1a;
      border: 1px solid rgba(186, 26, 26, 0.2);
    }
    .priority-tag[data-priority="ALTA"] { background: rgba(245, 158, 11, 0.1); color: #b45309; border-color: rgba(245,158,11,0.2); }
    .priority-tag[data-priority="MEDIA"] { background: var(--surface-container, #eeedf7); color: var(--on-surface-variant, #4c4546); border-color: var(--outline-variant, #cfc4c5); }
    .priority-tag[data-priority="BAJA"] { background: var(--surface-container, #eeedf7); color: var(--on-surface-variant, #4c4546); border-color: var(--outline-variant, #cfc4c5); opacity: 0.7; }

    .area-tag {
      padding: 6px 12px; border-radius: 9999px; text-align: center;
      background: var(--surface-container, #eeedf7);
      font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 700;
    }

    .assignee-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; background: white;
      border: 1px solid var(--outline-variant, #cfc4c5); border-radius: 9999px;
      cursor: pointer; transition: border-color 0.2s;
    }
    .assignee-row:hover { border-color: var(--primary, #1b1b1b); }
    .assignee-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--surface-container-highest, #e3e1ec);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Geist', sans-serif; font-size: 10px; font-weight: 700; flex-shrink: 0;
    }
    .assignee-info { flex: 1; min-width: 0; }
    .assignee-name { font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .edit-icon { font-size: 16px !important; color: var(--outline, #7e7576); transition: color 0.15s; }
    .assignee-row:hover .edit-icon { color: var(--primary, #1b1b1b); }

    /* SLA */
    .sla-card {
      padding: 16px; background: var(--primary, #1b1b1b);
      color: white; border-radius: 12px;
    }
    .sla-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .sla-label { font-family: 'Geist', sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.7; }
    .sla-status-badge {
      padding: 2px 8px; background: rgba(255,255,255,0.15); border-radius: 9999px;
      font-family: 'Geist', sans-serif; font-size: 9px; font-weight: 700;
    }
    .sla-time { font-family: 'Geist', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: -0.01em; }
    .sla-bar { margin-top: 14px; height: 6px; background: rgba(255,255,255,0.15); border-radius: 9999px; overflow: hidden; }
    .sla-progress { height: 100%; background: white; border-radius: 9999px; transition: width 1s; }

    /* History */
    .history-panel {}
    .history-title {
      font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 700;
      display: flex; align-items: center; gap: 8px; margin-bottom: 20px;
    }
    .history-timeline {
      position: relative; display: flex; flex-direction: column; gap: 20px;
    }
    .history-timeline::before {
      content: ''; position: absolute; left: 6px; top: 6px; bottom: 6px;
      width: 1.5px; background: var(--outline-variant, #cfc4c5);
    }
    .history-item { position: relative; padding-left: 28px; }
    .history-dot {
      position: absolute; left: 0; top: 4px;
      width: 14px; height: 14px; border-radius: 50%;
      background: var(--surface-container, #eeedf7);
      border: 2px solid var(--outline-variant, #cfc4c5);
      z-index: 1; display: flex; align-items: center; justify-content: center;
    }
    .history-dot.active { background: var(--primary, #1b1b1b); border-color: var(--primary, #1b1b1b); }
    .dot-inner { width: 6px; height: 6px; border-radius: 50%; background: white; }
    .history-text { font-size: 13px; color: var(--on-surface, #1a1b22); line-height: 1.4; font-weight: 500; }
    .history-text strong { font-weight: 700; }
    .history-meta { font-size: 10px; color: var(--outline, #7e7576); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 3px; }

    /* Skeletons */
    .skeleton-layout { display: grid; grid-template-columns: 1fr 300px; height: 100%; gap: 0; }
    .skeleton-left, .skeleton-right {
      animation: pulse 1.5s infinite; background: var(--surface-container, #eeedf7);
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    @media (max-width: 900px) {
      .detail-layout { grid-template-columns: 1fr; }
      .sidebar-column { border-left: none; border-top: 1px solid var(--outline-variant, #cfc4c5); }
      :host { height: auto; overflow: auto; }
    }
  `]
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private areaService = inject(AreaService);
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private appState = inject(AppStateService);
  private ws = inject(WebsocketService);
  private audioService = inject(AudioNotificationService);

  ticket = signal<any>(null);
  loading = signal(true);
  messages = signal<any[]>([]);
  historyEvents = signal<any[]>([]);
  areas = signal<any[]>([]);
  users = signal<any[]>([]);
  private ticketId = '';

  replyText = '';
  replyMode: 'reply' | 'internal' = 'reply';
  replyFocused = false;

  slaTime = '00:42:18';
  slaPercent = 65;

  ngOnInit() {
    // Load areas and users for dropdowns
    this.areaService.getAll().subscribe({
      next: (res: any) => this.areas.set(Array.isArray(res) ? res : res.content || []),
      error: () => {}
    });
    this.userService.getAll(0, 100).subscribe({
      next: (res: any) => this.users.set(Array.isArray(res) ? res : res.content || []),
      error: () => {}
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.ticketId = id;
        this.loadTicket(id);
      }
    });

    // SLA countdown
    setInterval(() => {
      const parts = this.slaTime.split(':').map(Number);
      let secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (secs > 0) {
        secs--;
        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        this.slaTime = `${h}:${m}:${s}`;
        this.slaPercent = Math.max(0, this.slaPercent - 0.01);
      }
    }, 1000);
  }

  loadTicket(id: string) {
    this.loading.set(true);
    this.ticketService.getById(id).subscribe({
      next: (ticket: any) => {
        this.ticket.set(ticket);
        this.loadMessages(id);
        this.loadHistory(id);
        this.loading.set(false);
        this.setupRealTimeChat(id);
      },
      error: () => {
        this.notification.error('Ticket no encontrado');
        this.loading.set(false);
        this.goBack();
      }
    });
  }

  private chatSub?: Subscription;

  setupRealTimeChat(ticketId: string) {
    const tenantId = this.appState.currentTenant()?.id || '';
    this.ws.connectChat(ticketId, tenantId);
    
    this.chatSub = this.ws.getChatMessages().subscribe((m: any) => {
      const currentUserId = this.appState.currentUser()?.id;
      // Prevent duplicating optimistic updates
      if (m.userId === currentUserId) return;

      const newMsg = {
        id: m.id,
        type: m.isInternal ? 'internal' : 'normal',
        isMe: false,
        userName: m.senderName || 'Usuario',
        text: m.message,
        time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      this.messages.update(msgs => [...msgs, newMsg]);
      this.audioService.play();
      this.scrollChat();
    });
  }

  ngOnDestroy() {
    if (this.chatSub) {
      this.chatSub.unsubscribe();
    }
    this.ws.disconnectChat();
  }

  loadMessages(id: string) {
    this.ticketService.getMessages(id).subscribe({
      next: (msgs: any[]) => {
        const currentUserId = this.appState.currentUser()?.id;
        const mapped = msgs.map((m: any) => ({
          id: m.id,
          type: m.isInternal ? 'internal' : 'normal',
          isMe: m.userId === currentUserId,
          userName: m.senderName || 'Usuario',
          text: m.message,
          time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        }));
        // Prepend the ticket description as the first message
        const t = this.ticket();
        if (t) {
          mapped.unshift({
            id: 'desc', type: 'normal', isMe: false,
            userName: t.createdByName || 'Creador',
            text: t.description || 'Sin descripción.',
            time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
          });
        }
        this.messages.set(mapped);
        this.scrollChat();
      },
      error: () => {
        // Fallback: show description only
        const t = this.ticket();
        if (t) {
          this.messages.set([{
            id: 'desc', type: 'normal', isMe: false,
            userName: t.createdByName || 'Usuario',
            text: t.description || 'Sin descripción.',
            time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
          }]);
        }
      }
    });
  }

  loadHistory(id: string) {
    this.ticketService.getHistory(id).subscribe({
      next: (events: any[]) => {
        const mapped = events.reverse().map((e: any, i: number) => ({
          id: e.id || i,
          active: i === 0,
          text: this.formatHistoryEvent(e),
          by: e.userName || 'System',
          time: e.timestamp ? new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        }));
        if (mapped.length === 0) {
          mapped.push({ id: 'created', active: true, text: 'Ticket creado', by: 'System', time: '' });
        }
        this.historyEvents.set(mapped);
      },
      error: () => {
        this.historyEvents.set([{ id: 'created', active: true, text: 'Ticket creado', by: 'System', time: '' }]);
      }
    });
  }

  formatHistoryEvent(e: any): string {
    switch (e.eventType) {
      case 'STATUS_CHANGED': return `Estado cambiado de <strong>${this.getStatusLabel(e.oldValue)}</strong> a <strong>${this.getStatusLabel(e.newValue)}</strong>`;
      case 'PRIORITY_CHANGED': return `Prioridad cambiada a <strong>${e.newValue}</strong>`;
      case 'AREA_CHANGED': return `Área reasignada`;
      case 'ASSIGNED': return `Ticket asignado`;
      case 'TICKET_CREATED': return `Ticket creado en el sistema`;
      case 'RATED': return `Ticket calificado con <strong>${e.newValue} estrellas</strong>`;
      default: return e.eventType || 'Evento';
    }
  }

  sendMessage() {
    if (!this.replyText.trim() || !this.ticketId) return;
    const user = this.appState.currentUser();
    const text = this.replyText.trim();
    const isInternal = this.replyMode === 'internal';

    // Optimistic UI update
    this.messages.update(msgs => [...msgs, {
      id: Date.now(), type: isInternal ? 'internal' : 'normal',
      isMe: true,
      userName: user?.name || 'Yo',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    this.replyText = '';
    this.scrollChat();

    // Persist to backend
    this.ticketService.sendMessage(this.ticketId, text, isInternal).subscribe({
      error: () => this.notification.error('Error al enviar mensaje')
    });
  }

  updateStatus(newStatus: string) {
    const current = this.ticket();
    if (!current?.id) return;

    // Call backend to persist
    this.ticketService.update(current.id, { ...current, status: newStatus }).subscribe({
      next: (updated: any) => {
        this.ticket.set(updated);
        this.notification.success(`Estado actualizado a ${this.getStatusLabel(newStatus)}`);
        this.loadHistory(current.id);
      },
      error: (err: any) => {
        this.notification.error(err?.error?.message || 'Transición de estado no válida');
        // Revert UI
        this.ticket.set({ ...current });
      }
    });
  }

  updateArea(areaId: string) {
    const current = this.ticket();
    if (!current?.id) return;

    this.ticketService.update(current.id, { ...current, areaId: areaId || null }).subscribe({
      next: (updated: any) => {
        this.ticket.set(updated);
        const areaName = this.areas().find(a => a.id === areaId)?.name || 'Sin Área';
        this.notification.success(`Área actualizada a ${areaName}`);
        this.loadHistory(current.id);
      },
      error: () => this.notification.error('Error al actualizar el área')
    });
  }

  updateAssignee(userId: string) {
    const current = this.ticket();
    if (!current?.id) return;

    this.ticketService.update(current.id, { ...current, assignedToId: userId || null }).subscribe({
      next: (updated: any) => {
        this.ticket.set(updated);
        const userName = this.users().find(u => u.id === userId)?.name || 'Sin asignar';
        this.notification.success(`Asignado a ${userName}`);
        this.loadHistory(current.id);
      },
      error: () => this.notification.error('Error al asignar colaborador')
    });
  }

  private scrollChat() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }

  goBack() { this.router.navigate(['/app/tickets']); }

  getInitials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getAICategory(): string {
    const t = this.ticket();
    if (!t) return 'Unknown';
    const categories: Record<string, string> = {
      'CRITICA': 'Critical Outage', 'ALTA': 'High Priority Issue',
      'MEDIA': 'Service Degradation', 'BAJA': 'Minor Issue'
    };
    return categories[t.priority] || 'Service Issue';
  }

  getAIKeyword(): string {
    const t = this.ticket();
    return t?.areaName || 'Infrastructure';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ABIERTO': 'Abierto', 'ASIGNADO': 'Asignado', 'EN_PROCESO': 'En Proceso',
      'PROPUESTO': 'Propuesto', 'RESUELTO': 'Resuelto', 'CERRADO': 'Cerrado'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'BAJA': 'P3 - Low', 'MEDIA': 'P2 - Med', 'ALTA': 'P1 - High', 'CRITICA': 'P0 - Critical'
    };
    return labels[priority] || priority;
  }
}
