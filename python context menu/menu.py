#!/usr/bin/env python3
"""
Custom Audio Menu per Ubuntu
Chiama endpoint: http://192.168.1.70:30001/audio/play/FILE.mp3

Configurazione scorciatoia:
1. Impostazioni → Tastiera → Scorciatoie personalizzate
2. Comando: /var/www/html/context_menu/ubuntu_menu.py
3. Imposta la combinazione di tasti (es. Ctrl+Shift+M)
"""

import gi
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk, Gdk, GLib
import urllib.request
import urllib.error
import threading
import subprocess
import os

# === CONFIGURAZIONE ===
ENDPOINT_BASE = "http://192.168.1.70:30001/audio/play"

# Modifica questa lista per aggiungere/rimuovere suoni
# Formato: {'label': 'Nome visualizzato', 'file': 'nomefile.mp3', 'icon': 'emoji'}
# list http://192.168.1.70:30001/audio/
AUDIO_ITEMS = [
    {'label': 'Aldooooooooooo', 'file': 'aldoooo-aldo-giovanni-e-giacomo.mp3', 'icon': '🔔'},
    {'label': 'Chiudilo', 'file': 'sto-pezzo-di-cacca-chiudilo.mp3', 'icon': '👏'},
    {'label': 'Delicatissimo', 'file': 'delicatissimo.mp3', 'icon': '🚨'},
    {'label': 'E sti cazzi', 'file': 'e_sti_cazzi_XBk0OZt.m+p3', 'icon': '🚪'},
    {'label': 'Manu blasta tutti', 'file': 'manu_blasta_tutti.mp3', 'icon': '🚪'},
    {'label': 'Un appluaso', 'file': 'applausiiiiiii_mvvLWOta.mp3', 'icon': '👏'},
    {'label': 'Vafanculo', 'file': 'vafancu-o-aldo-giovanni-e-giacomo.mp3', 'icon': '❌'},
    {'label': 'Vergognati', 'file': 'vergognati.mp3', 'icon': '✅'},
    {'type': 'separator'},
    {'label': 'Modifica Menu', 'file': '', 'icon': '✏️', 'is_edit': True},
]

# Percorso di questo script (per la funzione "Modifica Menu")
SCRIPT_PATH = __file__


class AudioMenu(Gtk.Window):
    def __init__(self):
        super().__init__(type=Gtk.WindowType.TOPLEVEL)
        
        # Configurazione finestra
        self.set_decorated(False)
        self.set_resizable(False)
        self.set_keep_above(True)
        self.set_skip_taskbar_hint(True)
        self.set_skip_pager_hint(True)
        self.set_accept_focus(True)
        self.set_can_focus(True)
        self.set_modal(True)
        
        # Stile CSS
        self.setup_css()
        
        # Container principale
        self.main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        self.main_box.get_style_context().add_class('menu-container')
        self.add(self.main_box)
        
        # Header
        header = Gtk.Label(label="🎧 Audio Player")
        header.get_style_context().add_class('menu-header')
        self.main_box.pack_start(header, False, False, 8)
        
        # Separatore dopo header
        sep = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
        sep.get_style_context().add_class('menu-separator')
        self.main_box.pack_start(sep, False, False, 4)
        
        self.buttons = []
        self.current_index = 0
        
        # Crea le voci del menu
        for item in AUDIO_ITEMS:
            if item.get('type') == 'separator':
                separator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
                separator.get_style_context().add_class('menu-separator')
                self.main_box.pack_start(separator, False, False, 4)
            else:
                btn = self.create_menu_item(item)
                self.buttons.append((btn, item))
                self.main_box.pack_start(btn, False, False, 0)
        
        # Eventi
        self.connect('key-press-event', self.on_key_press)
        self.connect('button-press-event', self.on_button_press)
        self.connect('focus-out-event', self.on_focus_out)
        self.connect('show', self.on_show)
        
        self.add_events(Gdk.EventMask.BUTTON_PRESS_MASK)
        
        self.show_all()
        self.position_near_mouse()
        
        if self.buttons:
            self.highlight_item(0)
    
    def on_show(self, widget):
        GLib.timeout_add(50, self.grab_all_focus)
    
    def grab_all_focus(self):
        self.present()
        self.grab_focus()
        
        window = self.get_window()
        if window:
            Gdk.keyboard_grab(window, True, Gdk.CURRENT_TIME)
            Gdk.pointer_grab(
                window, True,
                Gdk.EventMask.BUTTON_PRESS_MASK | Gdk.EventMask.BUTTON_RELEASE_MASK,
                None, None, Gdk.CURRENT_TIME
            )
        return False
    
    def position_near_mouse(self):
        display = Gdk.Display.get_default()
        seat = display.get_default_seat()
        pointer = seat.get_pointer()
        screen, mouse_x, mouse_y = pointer.get_position()
        
        self.realize()
        allocation = self.get_allocation()
        menu_width = allocation.width if allocation.width > 1 else 280
        menu_height = allocation.height if allocation.height > 1 else 400
        
        monitor = display.get_monitor_at_point(mouse_x, mouse_y)
        geometry = monitor.get_geometry()
        screen_width = geometry.x + geometry.width
        screen_height = geometry.y + geometry.height
        
        x = mouse_x
        y = mouse_y
        
        if x + menu_width > screen_width:
            x = screen_width - menu_width - 10
        if y + menu_height > screen_height:
            y = screen_height - menu_height - 10
        
        x = max(geometry.x + 5, x)
        y = max(geometry.y + 5, y)
        
        self.move(x, y)
    
    def setup_css(self):
        css = b'''
        window {
            background-color: transparent;
        }
        
        .menu-container {
            background-color: #1a1a2e;
            border-radius: 12px;
            padding: 8px 0;
            border: 1px solid #e94560;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        
        .menu-header {
            color: #e94560;
            font-size: 14px;
            font-weight: bold;
            padding: 4px 16px;
        }
        
        .menu-item {
            padding: 10px 16px;
            border-radius: 0;
            background: transparent;
            border: none;
            min-width: 240px;
        }
        
        .menu-item:hover, .menu-item.highlighted {
            background-color: rgba(233, 69, 96, 0.3);
        }
        
        .menu-item label {
            color: #e0e0e0;
            font-size: 14px;
        }
        
        .menu-item:hover label, .menu-item.highlighted label {
            color: #ffffff;
        }
        
        .menu-icon {
            font-size: 16px;
            margin-right: 12px;
        }
        
        .menu-file {
            color: #666666;
            font-size: 11px;
            font-family: monospace;
        }
        
        .menu-separator {
            background-color: #3a3a4a;
            margin: 4px 16px;
            min-height: 1px;
        }
        
        .stop-item label {
            color: #ff6b6b;
        }
        '''
        
        style_provider = Gtk.CssProvider()
        style_provider.load_from_data(css)
        Gtk.StyleContext.add_provider_for_screen(
            Gdk.Screen.get_default(),
            style_provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        )
    
    def create_menu_item(self, item):
        btn = Gtk.Button()
        btn.set_relief(Gtk.ReliefStyle.NONE)
        btn.get_style_context().add_class('menu-item')
        if item.get('is_stop'):
            btn.get_style_context().add_class('stop-item')
        btn.set_can_focus(False)
        
        hbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        
        # Icona
        icon_label = Gtk.Label(label=item['icon'])
        icon_label.get_style_context().add_class('menu-icon')
        hbox.pack_start(icon_label, False, False, 8)
        
        # Testo
        text_label = Gtk.Label(label=item['label'])
        text_label.set_xalign(0)
        hbox.pack_start(text_label, True, True, 0)
        
        # Nome file (piccolo, a destra) - non mostrare per stop e edit
        # if not item.get('is_stop') and not item.get('is_edit'):
        #     file_label = Gtk.Label(label=item['file'])
        #     file_label.get_style_context().add_class('menu-file')
        #     hbox.pack_end(file_label, False, False, 8)
        
        btn.add(hbox)
        btn.connect('clicked', lambda w, i=item: self.execute_and_close(i))
        btn.connect('enter-notify-event', lambda w, e, idx=len(self.buttons): self.highlight_item(idx))
        
        return btn
    
    def highlight_item(self, index):
        for btn, _ in self.buttons:
            btn.get_style_context().remove_class('highlighted')
        
        if 0 <= index < len(self.buttons):
            self.current_index = index
            self.buttons[index][0].get_style_context().add_class('highlighted')
    
    def on_key_press(self, widget, event):
        keyval = event.keyval
        
        if keyval == Gdk.KEY_Escape:
            self.close_menu()
        elif keyval == Gdk.KEY_Return or keyval == Gdk.KEY_KP_Enter:
            if 0 <= self.current_index < len(self.buttons):
                _, item = self.buttons[self.current_index]
                self.execute_and_close(item)
        elif keyval == Gdk.KEY_Up or keyval == Gdk.KEY_k:
            new_index = (self.current_index - 1) % len(self.buttons)
            self.highlight_item(new_index)
        elif keyval == Gdk.KEY_Down or keyval == Gdk.KEY_j:
            new_index = (self.current_index + 1) % len(self.buttons)
            self.highlight_item(new_index)
        
        return True
    
    def on_button_press(self, widget, event):
        allocation = self.get_allocation()
        x, y = event.x, event.y
        if x < 0 or y < 0 or x > allocation.width or y > allocation.height:
            self.close_menu()
            return True
        return False
    
    def on_focus_out(self, widget, event):
        GLib.timeout_add(100, self.close_menu)
        return False
    
    def execute_and_close(self, item):
        self.release_grabs()
        self.hide()
        
        # Chiama l'endpoint in un thread separato
        threading.Thread(target=self.play_audio, args=(item,), daemon=True).start()
        
        GLib.timeout_add(100, self.close_menu)
    
    def play_audio(self, item):
        """Chiama l'endpoint HTTP per riprodurre l'audio o apri editor"""
        
        # Apri editor per modificare questo file
        if item.get('is_edit'):
            self.open_editor()
            return
        
        filename = item['file']
        
        if item.get('is_stop'):
            url = f"{ENDPOINT_BASE}/stop"
        else:
            url = f"{ENDPOINT_BASE}/{filename}"
        
        try:
            req = urllib.request.Request(url, method='GET')
            with urllib.request.urlopen(req, timeout=5) as response:
                print(f"✓ {item['label']}: {response.status}")
        except urllib.error.URLError as e:
            print(f"✗ Errore connessione: {e}")
        except Exception as e:
            print(f"✗ Errore: {e}")
    
    def open_editor(self):
        """Apre questo script in un editor di testo"""
        script_path = os.path.abspath(SCRIPT_PATH)
        
        # Lista di editor da provare (in ordine di preferenza)
        editors = [
            ['code', script_path],           # VS Code
            ['cursor', script_path],         # Cursor
            ['gedit', script_path],          # GNOME
            ['kate', script_path],           # KDE
            ['mousepad', script_path],       # XFCE
            ['xed', script_path],            # Linux Mint
            ['pluma', script_path],          # MATE
            ['xdg-open', script_path],       # Default sistema
        ]
        
        for editor_cmd in editors:
            try:
                subprocess.Popen(editor_cmd, start_new_session=True,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                print(f"✓ Aperto con: {editor_cmd[0]}")
                return
            except FileNotFoundError:
                continue
        
        print("✗ Nessun editor trovato")
    
    def release_grabs(self):
        Gdk.pointer_ungrab(Gdk.CURRENT_TIME)
        Gdk.keyboard_ungrab(Gdk.CURRENT_TIME)
    
    def close_menu(self):
        self.release_grabs()
        Gtk.main_quit()
        return False


def main():
    menu = AudioMenu()
    Gtk.main()


if __name__ == '__main__':
    main()
