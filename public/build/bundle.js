
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                else
                    this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.55.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var _e = Object.defineProperty, Ue = Object.defineProperties;
    var Pe = Object.getOwnPropertyDescriptors;
    var B = Object.getOwnPropertySymbols;
    var Z = Object.prototype.hasOwnProperty, ee = Object.prototype.propertyIsEnumerable;
    var te = Math.pow, Q = (e, t, r) => t in e ? _e(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, T = (e, t) => {
      for (var r in t || (t = {}))
        Z.call(t, r) && Q(e, r, t[r]);
      if (B)
        for (var r of B(t))
          ee.call(t, r) && Q(e, r, t[r]);
      return e;
    }, R = (e, t) => Ue(e, Pe(t));
    var re = (e, t) => {
      var r = {};
      for (var n in e)
        Z.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
      if (e != null && B)
        for (var n of B(e))
          t.indexOf(n) < 0 && ee.call(e, n) && (r[n] = e[n]);
      return r;
    };
    var S = (e, t, r) => new Promise((n, a) => {
      var s = (l) => {
        try {
          i(r.next(l));
        } catch (u) {
          a(u);
        }
      }, o = (l) => {
        try {
          i(r.throw(l));
        } catch (u) {
          a(u);
        }
      }, i = (l) => l.done ? n(l.value) : Promise.resolve(l.value).then(s, o);
      i((r = r.apply(e, t)).next());
    });
    function ue(e, t) {
      return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
    }
    const fe = "p".charCodeAt(0), de = "H".charCodeAt(0), ge = "Y".charCodeAt(0), me = "s".charCodeAt(0);
    let j;
    function $e() {
      const e = new Int32Array(256);
      for (let t = 0; t < 256; t++) {
        let r = t;
        for (let n = 0; n < 8; n++)
          r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
        e[t] = r;
      }
      return e;
    }
    function Be(e) {
      let t = -1;
      j || (j = $e());
      for (let r = 0; r < e.length; r++)
        t = j[(t ^ e[r]) & 255] ^ t >>> 8;
      return t ^ -1;
    }
    function Le(e) {
      const t = e.length - 1;
      for (let r = t; r >= 4; r--)
        if (e[r - 4] === 9 && e[r - 3] === fe && e[r - 2] === de && e[r - 1] === ge && e[r] === me)
          return r - 3;
      return 0;
    }
    function he(e, t, r = !1) {
      const n = new Uint8Array(13);
      t *= 39.3701, n[0] = fe, n[1] = de, n[2] = ge, n[3] = me, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
      const a = Be(n), s = new Uint8Array(4);
      if (s[0] = a >>> 24, s[1] = a >>> 16, s[2] = a >>> 8, s[3] = a & 255, r) {
        const o = Le(e);
        return e.set(n, o), e.set(s, o + 13), e;
      } else {
        const o = new Uint8Array(4);
        o[0] = 0, o[1] = 0, o[2] = 0, o[3] = 9;
        const i = new Uint8Array(54);
        return i.set(e, 0), i.set(o, 33), i.set(n, 37), i.set(s, 50), i;
      }
    }
    const H = "[modern-screenshot]", x = typeof window != "undefined", je = x && "Worker" in window, we = x && "atob" in window;
    var le;
    const z = x ? (le = window.navigator) == null ? void 0 : le.userAgent : "", pe = z.includes("Chrome"), L = z.includes("AppleWebKit") && !pe, X = z.includes("Firefox"), He = (e) => e && "__CONTEXT__" in e, ze = (e) => e.constructor.name === "CSSFontFaceRule", Xe = (e) => e.constructor.name === "CSSImportRule", A = (e) => e.nodeType === 1, U = (e) => typeof e.className == "object", ye = (e) => e.tagName === "image", Ge = (e) => e.tagName === "use", G = (e) => A(e) && typeof e.style != "undefined" && !U(e), Ye = (e) => e.nodeType === 8, Je = (e) => e.nodeType === 3, D = (e) => e.tagName === "IMG", M = (e) => e.tagName === "VIDEO", Ke = (e) => e.tagName === "CANVAS", ne = (e) => e.tagName === "TEXTAREA", Qe = (e) => e.tagName === "INPUT", Ze = (e) => e.tagName === "STYLE", et = (e) => e.tagName === "SCRIPT", tt = (e) => e.tagName === "SELECT", rt = (e) => e.tagName === "SLOT", nt = (e) => e.tagName === "IFRAME", E = (...e) => console.warn(H, ...e), ot = (e) => console.time(`${H} ${e}`), at = (e) => console.timeEnd(`${H} ${e}`), st = (e) => {
      var r;
      const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
      return t && (t.height = t.width = 1), t && "toDataURL" in t && Boolean(t.toDataURL("image/webp").includes("image/webp"));
    }, V = (e) => e.startsWith("data:");
    function be(e, t) {
      if (e.match(/^[a-z]+:\/\//i))
        return e;
      if (x && e.match(/^\/\//))
        return window.location.protocol + e;
      if (e.match(/^[a-z]+:/i) || !x)
        return e;
      const r = O().implementation.createHTMLDocument(), n = r.createElement("base"), a = r.createElement("a");
      return r.head.appendChild(n), r.body.appendChild(a), t && (n.href = t), a.href = e, a.href;
    }
    function O(e) {
      var t;
      return (t = e && A(e) ? e == null ? void 0 : e.ownerDocument : e) != null ? t : window.document;
    }
    const W = "http://www.w3.org/2000/svg";
    function Se(e, t, r) {
      const n = O(r).createElementNS(W, "svg");
      return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
    }
    function Ee(e, t) {
      let r = new XMLSerializer().serializeToString(e);
      return t && (r = r.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/ug, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
    }
    function it(e, t = "image/png", r = 1) {
      return S(this, null, function* () {
        try {
          return yield new Promise((n, a) => {
            e.toBlob((s) => {
              s ? n(s) : a(new Error("Blob is null"));
            }, t, r);
          });
        } catch (n) {
          if (we)
            return E("Failed canvas to blob", { type: t, quality: r }, n), ct(e.toDataURL(t, r));
          throw n;
        }
      });
    }
    function ct(e) {
      var i, l;
      const [t, r] = e.split(","), n = (l = (i = t.match(/data:(.+);/)) == null ? void 0 : i[1]) != null ? l : void 0, a = window.atob(r), s = a.length, o = new Uint8Array(s);
      for (let u = 0; u < s; u += 1)
        o[u] = a.charCodeAt(u);
      return new Blob([o], { type: n });
    }
    function Ce(e, t) {
      return new Promise((r, n) => {
        const a = new FileReader();
        a.onload = () => r(a.result), a.onerror = () => n(a.error), a.onabort = () => n(new Error(`Failed read blob to ${t}`)), t === "dataUrl" ? a.readAsDataURL(e) : t === "arrayBuffer" && a.readAsArrayBuffer(e);
      });
    }
    const lt = (e) => Ce(e, "dataUrl"), ut = (e) => Ce(e, "arrayBuffer");
    function k(e, t) {
      const r = O(t).createElement("img");
      return r.decoding = "sync", r.loading = "eager", r.src = e, r;
    }
    function F(e, t) {
      return new Promise((r) => {
        const { timeout: n, ownerDocument: a, onError: s } = t != null ? t : {}, o = typeof e == "string" ? k(e, O(a)) : e;
        let i = null, l = null;
        function u() {
          r(o), i && clearTimeout(i), l == null || l();
        }
        if (n && (i = setTimeout(u, n)), M(o)) {
          const c = o.currentSrc || o.src;
          if (!c)
            return o.poster ? F(o.poster, t).then(r) : u();
          if (o.readyState >= 2)
            return u();
          const f = u, d = (g) => {
            E(
              "Failed video load",
              c,
              g
            ), s == null || s(g), u();
          };
          l = () => {
            o.removeEventListener("loadeddata", f), o.removeEventListener("error", d);
          }, o.addEventListener("loadeddata", f, { once: !0 }), o.addEventListener("error", d, { once: !0 });
        } else {
          const c = ye(o) ? o.href.baseVal : o.currentSrc || o.src;
          if (!c)
            return u();
          const f = () => S(this, null, function* () {
            if (D(o) && "decode" in o)
              try {
                yield o.decode();
              } catch (g) {
                E(
                  "Failed to decode image, trying to render anyway",
                  o.dataset.originalSrc || c,
                  g
                );
              }
            u();
          }), d = (g) => {
            E(
              "Failed image load",
              o.dataset.originalSrc || c,
              g
            ), u();
          };
          if (D(o) && o.complete)
            return f();
          l = () => {
            o.removeEventListener("load", f), o.removeEventListener("error", d);
          }, o.addEventListener("load", f, { once: !0 }), o.addEventListener("error", d, { once: !0 });
        }
      });
    }
    function ft(e, t) {
      return S(this, null, function* () {
        G(e) && (D(e) || M(e) ? yield F(e, { timeout: t }) : yield Promise.all(
          ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => F(n, { timeout: t })))
        ));
      });
    }
    const ve = function() {
      let t = 0;
      const r = () => (
        // eslint-disable-next-line no-bitwise
        `0000${(Math.random() * te(36, 4) << 0).toString(36)}`.slice(-4)
      );
      return () => (t += 1, `u${r()}${t}`);
    }();
    function Te(e) {
      return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
    }
    function dt(e) {
      return {
        time: (t) => e && ot(t),
        timeEnd: (t) => e && at(t),
        warn: (...t) => e && E(...t)
      };
    }
    function gt(e) {
      return {
        cache: e ? "no-cache" : "force-cache"
      };
    }
    function N(e, t) {
      return S(this, null, function* () {
        return He(e) ? e : mt(e, R(T({}, t), { autoDestruct: !0 }));
      });
    }
    function mt(e, t) {
      return S(this, null, function* () {
        var g, h, w, y, m;
        const { scale: r = 1, workerUrl: n, workerNumber: a = 1 } = t || {}, s = Boolean(t == null ? void 0 : t.debug), o = (g = t == null ? void 0 : t.features) != null ? g : !0, i = (h = e.ownerDocument) != null ? h : x ? window.document : void 0, l = (y = (w = e.ownerDocument) == null ? void 0 : w.defaultView) != null ? y : x ? window : void 0, u = /* @__PURE__ */ new Map(), c = R(T({
          // Options
          width: 0,
          height: 0,
          quality: 1,
          type: "image/png",
          scale: r,
          backgroundColor: null,
          style: null,
          filter: null,
          maximumCanvasSize: 0,
          timeout: 3e4,
          progress: null,
          debug: s,
          fetch: T({
            requestInit: gt((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
            placeholderImage: "data:image/png;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
            bypassingCache: !1
          }, t == null ? void 0 : t.fetch),
          fetchFn: null,
          font: {},
          drawImageInterval: 100,
          workerUrl: null,
          workerNumber: a,
          onCloneNode: null,
          onEmbedNode: null,
          onCreateForeignObjectSvg: null,
          includeStyleProperties: null,
          autoDestruct: !1
        }, t), {
          // InternalContext
          __CONTEXT__: !0,
          log: dt(s),
          node: e,
          ownerDocument: i,
          ownerWindow: l,
          dpi: r === 1 ? null : 96 * r,
          svgStyleElement: Ae(i),
          svgDefsElement: i == null ? void 0 : i.createElementNS(W, "defs"),
          svgStyles: /* @__PURE__ */ new Map(),
          defaultComputedStyles: /* @__PURE__ */ new Map(),
          workers: [
            ...new Array(
              je && n && a ? a : 0
            )
          ].map(() => {
            try {
              const b = new Worker(n);
              return b.onmessage = (p) => S(this, null, function* () {
                var I, J, $, K;
                const { url: C, result: v } = p.data;
                v ? (J = (I = u.get(C)) == null ? void 0 : I.resolve) == null || J.call(I, v) : (K = ($ = u.get(C)) == null ? void 0 : $.reject) == null || K.call($, new Error(`Error receiving message from worker: ${C}`));
              }), b.onmessageerror = (p) => {
                var v, I;
                const { url: C } = p.data;
                (I = (v = u.get(C)) == null ? void 0 : v.reject) == null || I.call(v, new Error(`Error receiving message from worker: ${C}`));
              }, b;
            } catch (b) {
              return E("Failed to new Worker", b), null;
            }
          }).filter(Boolean),
          fontFamilies: /* @__PURE__ */ new Set(),
          fontCssTexts: /* @__PURE__ */ new Map(),
          acceptOfImage: `${[
        st(i) && "image/webp",
        "image/svg+xml",
        "image/*",
        "*/*"
      ].filter(Boolean).join(",")};q=0.8`,
          requests: u,
          drawImageCount: 0,
          tasks: [],
          features: o,
          isEnable: (b) => {
            var p;
            return typeof o == "boolean" ? o : (p = o[b]) != null ? p : !0;
          }
        });
        c.log.time("wait until load"), yield ft(e, c.timeout), c.log.timeEnd("wait until load");
        const { width: f, height: d } = ht(e, c);
        return c.width = f, c.height = d, c;
      });
    }
    function Ae(e) {
      if (!e)
        return;
      const t = e.createElement("style"), r = t.ownerDocument.createTextNode(`
.______background-clip--text {
  background-clip: text;
  -webkit-background-clip: text;
}
`);
      return t.appendChild(r), t;
    }
    function ht(e, t) {
      let { width: r, height: n } = t;
      if (A(e) && (!r || !n)) {
        const a = e.getBoundingClientRect();
        r = r || a.width || Number(e.getAttribute("width")) || 0, n = n || a.height || Number(e.getAttribute("height")) || 0;
      }
      return { width: r, height: n };
    }
    function wt(e, t) {
      return S(this, null, function* () {
        const {
          log: r,
          timeout: n,
          drawImageCount: a,
          drawImageInterval: s
        } = t;
        r.time("image to canvas");
        const o = yield F(e, { timeout: n }), { canvas: i, context2d: l } = pt(e.ownerDocument, t), u = () => {
          try {
            l == null || l.drawImage(o, 0, 0, i.width, i.height);
          } catch (c) {
            E("Failed to drawImage", c);
          }
        };
        if (u(), t.isEnable("fixSvgXmlDecode"))
          for (let c = 0; c < a; c++)
            yield new Promise((f) => {
              setTimeout(() => {
                u(), f();
              }, c + s);
            });
        return t.drawImageCount = 0, r.timeEnd("image to canvas"), i;
      });
    }
    function pt(e, t) {
      const { width: r, height: n, scale: a, backgroundColor: s, maximumCanvasSize: o } = t, i = e.createElement("canvas");
      i.width = Math.floor(r * a), i.height = Math.floor(n * a), i.style.width = `${r}px`, i.style.height = `${n}px`, o && (i.width > o || i.height > o) && (i.width > o && i.height > o ? i.width > i.height ? (i.height *= o / i.width, i.width = o) : (i.width *= o / i.height, i.height = o) : i.width > o ? (i.height *= o / i.width, i.width = o) : (i.width *= o / i.height, i.height = o));
      const l = i.getContext("2d");
      return l && s && (l.fillStyle = s, l.fillRect(0, 0, i.width, i.height)), { canvas: i, context2d: l };
    }
    const yt = [
      "width",
      "height",
      "-webkit-text-fill-color"
    ], bt = [
      "stroke",
      "fill"
    ];
    function Ne(e, t, r) {
      var y;
      const { defaultComputedStyles: n, ownerDocument: a } = r, s = e.nodeName.toLowerCase(), o = U(e) && s !== "svg", i = o ? bt.map((m) => [m, e.getAttribute(m)]).filter(([, m]) => m !== null) : [], l = [
        o && "svg",
        s,
        i.map((m, b) => `${m}=${b}`).join(","),
        t
      ].filter(Boolean).join(":");
      if (n.has(l))
        return n.get(l);
      let u = r.sandbox;
      if (!u)
        try {
          a && (u = a.createElement("iframe"), u.id = `__SANDBOX__-${ve()}`, u.width = "0", u.height = "0", u.style.visibility = "hidden", u.style.position = "fixed", a.body.appendChild(u), (y = u.contentWindow) == null || y.document.write('<!DOCTYPE html><meta charset="UTF-8"><title></title><body>'), r.sandbox = u);
        } catch (m) {
          E("Failed to create iframe sandbox", m);
        }
      if (!u)
        return /* @__PURE__ */ new Map();
      const c = u.contentWindow;
      if (!c)
        return /* @__PURE__ */ new Map();
      const f = c.document;
      let d, g;
      o ? (d = f.createElementNS(W, "svg"), g = d.ownerDocument.createElementNS(d.namespaceURI, s), i.forEach(([m, b]) => {
        g.setAttributeNS(null, m, b);
      }), d.appendChild(g)) : d = g = f.createElement(s), g.textContent = " ", f.body.appendChild(d);
      const h = c.getComputedStyle(g, t), w = /* @__PURE__ */ new Map();
      for (let m = h.length, b = 0; b < m; b++) {
        const p = h.item(b);
        yt.includes(p) || w.set(p, h.getPropertyValue(p));
      }
      return f.body.removeChild(d), n.set(l, w), w;
    }
    function Ie(e, t, r) {
      var i;
      const n = /* @__PURE__ */ new Map(), a = [], s = /* @__PURE__ */ new Map();
      if (r)
        for (const l of r)
          o(l);
      else
        for (let l = e.length, u = 0; u < l; u++) {
          const c = e.item(u);
          o(c);
        }
      for (let l = a.length, u = 0; u < l; u++)
        (i = s.get(a[u])) == null || i.forEach((c, f) => n.set(f, c));
      function o(l) {
        const u = e.getPropertyValue(l), c = e.getPropertyPriority(l), f = l.lastIndexOf("-"), d = f > -1 ? l.substring(0, f) : void 0;
        if (d) {
          let g = s.get(d);
          g || (g = /* @__PURE__ */ new Map(), s.set(d, g)), g.set(l, [u, c]);
        }
        t.get(l) === u && !c || (d ? a.push(d) : n.set(l, [u, c]));
      }
      return n;
    }
    const St = [
      ":before",
      ":after"
      // ':placeholder', TODO
    ], Et = [
      ":-webkit-scrollbar",
      ":-webkit-scrollbar-button",
      // ':-webkit-scrollbar:horizontal', TODO
      ":-webkit-scrollbar-thumb",
      ":-webkit-scrollbar-track",
      ":-webkit-scrollbar-track-piece",
      // ':-webkit-scrollbar:vertical', TODO
      ":-webkit-scrollbar-corner",
      ":-webkit-resizer"
    ];
    function Ct(e, t, r, n) {
      const { ownerWindow: a, svgStyleElement: s, svgStyles: o, currentNodeStyle: i } = n;
      if (!s || !a)
        return;
      function l(u) {
        var b;
        const c = a.getComputedStyle(e, u);
        let f = c.getPropertyValue("content");
        if (!f || f === "none")
          return;
        f = f.replace(/(')|(")|(counter\(.+\))/g, "");
        const d = [ve()], g = Ne(e, u, n);
        i == null || i.forEach((p, C) => {
          g.delete(C);
        });
        const h = Ie(c, g, n.includeStyleProperties);
        h.delete("content"), h.delete("-webkit-locale"), ((b = h.get("background-clip")) == null ? void 0 : b[0]) === "text" && t.classList.add("______background-clip--text");
        const w = [
          `content: '${f}';`
        ];
        if (h.forEach(([p, C], v) => {
          w.push(`${v}: ${p}${C ? " !important" : ""};`);
        }), w.length === 1)
          return;
        try {
          t.className = [t.className, ...d].join(" ");
        } catch (p) {
          return;
        }
        const y = w.join(`
  `);
        let m = o.get(y);
        m || (m = [], o.set(y, m)), m.push(`.${d[0]}:${u}`);
      }
      St.forEach(l), r && Et.forEach(l);
    }
    function vt(e, t) {
      ne(e) && (t.innerHTML = e.value), (ne(e) || Qe(e) || tt(e)) && t.setAttribute("value", e.value);
    }
    function Tt(e, t, r, n) {
      var f, d, g, h;
      const { ownerWindow: a, includeStyleProperties: s, currentParentNodeStyle: o } = n, i = t.style, l = a.getComputedStyle(e), u = Ne(e, null, n);
      o == null || o.forEach((w, y) => {
        u.delete(y);
      });
      const c = Ie(l, u, s);
      return c.delete("transition-property"), c.delete("all"), c.delete("d"), c.delete("content"), r && (c.delete("margin-top"), c.delete("margin-right"), c.delete("margin-bottom"), c.delete("margin-left"), c.delete("margin-block-start"), c.delete("margin-block-end"), c.delete("margin-inline-start"), c.delete("margin-inline-end"), c.set("box-sizing", ["border-box", ""])), ((f = c.get("background-clip")) == null ? void 0 : f[0]) === "text" && t.classList.add("______background-clip--text"), pe && (c.has("font-kerning") || c.set("font-kerning", ["normal", ""]), (((d = c.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((g = c.get("overflow-y")) == null ? void 0 : g[0]) === "hidden") && ((h = c.get("text-overflow")) == null ? void 0 : h[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && c.set("text-overflow", ["clip", ""])), c.forEach(([w, y], m) => {
        i.setProperty(m, w, y);
      }), c;
    }
    function At(e, t) {
      var r;
      try {
        if ((r = e == null ? void 0 : e.contentDocument) != null && r.body)
          return q(e.contentDocument.body, t);
      } catch (n) {
        E("Failed to clone iframe", n);
      }
      return e.cloneNode(!1);
    }
    function xe(e) {
      if (e.ownerDocument)
        try {
          const a = e.toDataURL();
          if (a !== "data:,")
            return k(a, e.ownerDocument);
        } catch (a) {
        }
      const t = e.cloneNode(!1), r = e.getContext("2d"), n = t.getContext("2d");
      try {
        return r && n && n.putImageData(
          r.getImageData(0, 0, e.width, e.height),
          0,
          0
        ), t;
      } catch (a) {
        E("Failed to clone canvas", a);
      }
      return t;
    }
    function Nt(e) {
      return S(this, null, function* () {
        if (e.ownerDocument && !e.currentSrc && e.poster)
          return k(e.poster, e.ownerDocument);
        const t = e.cloneNode(!1);
        t.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc);
        const r = t.ownerDocument;
        if (r) {
          let n = !0;
          if (yield F(t, {
            onError: () => n = !1
          }), !n)
            return e.poster ? k(e.poster, e.ownerDocument) : t;
          t.currentTime = e.currentTime, yield new Promise((s) => {
            t.addEventListener("seeked", s, { once: !0 });
          });
          const a = r.createElement("canvas");
          a.width = e.offsetWidth, a.height = e.offsetHeight;
          try {
            const s = a.getContext("2d");
            s && s.drawImage(t, 0, 0, a.width, a.height);
          } catch (s) {
            return E("Failed to clone video", s), e.poster ? k(e.poster, e.ownerDocument) : t;
          }
          return xe(a);
        }
        return t;
      });
    }
    function It(e) {
      const t = e.cloneNode(!1);
      return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
    }
    function xt(e, t) {
      return Ke(e) ? xe(e) : nt(e) ? At(e, t) : D(e) ? It(e) : M(e) ? Nt(e) : e.cloneNode(!1);
    }
    const oe = /* @__PURE__ */ new Set([
      "symbol"
      // test/fixtures/svg.symbol.html
    ]);
    function ae(e, t, r) {
      return S(this, null, function* () {
        A(t) && (Ze(t) || et(t)) || r.filter && !r.filter(t) || (oe.has(e.nodeName) || oe.has(t.nodeName) ? r.currentParentNodeStyle = void 0 : r.currentParentNodeStyle = r.currentNodeStyle, e.appendChild(yield q(t, r)));
      });
    }
    function se(e, t, r) {
      return S(this, null, function* () {
        var a, s;
        const n = (s = A(e) ? (a = e.shadowRoot) == null ? void 0 : a.firstChild : void 0) != null ? s : e.firstChild;
        for (let o = n; o; o = o.nextSibling)
          if (!Ye(o))
            if (A(o) && rt(o) && typeof o.assignedNodes == "function") {
              const i = o.assignedNodes();
              for (let l = 0; l < i.length; l++)
                yield ae(t, i[l], r);
            } else
              yield ae(t, o, r);
      });
    }
    function kt(e, t) {
      const { backgroundColor: r, width: n, height: a, style: s } = t, o = e.style;
      if (r && o.setProperty("background-color", r, "important"), n && o.setProperty("width", `${n}px`, "important"), a && o.setProperty("height", `${a}px`, "important"), s)
        for (const i in s)
          o[i] = s[i];
    }
    const Rt = /^[\w-:]+$/;
    function q(e, t, r = !1) {
      return S(this, null, function* () {
        var i, l, u, c;
        const { ownerDocument: n, ownerWindow: a, fontFamilies: s } = t;
        if (n && Je(e))
          return n.createTextNode(e.data);
        if (n && a && A(e) && (G(e) || U(e))) {
          const f = yield xt(e, t);
          if (t.isEnable("removeAbnormalAttributes")) {
            const h = f.getAttributeNames();
            for (let w = h.length, y = 0; y < w; y++) {
              const m = h[y];
              Rt.test(m) || f.removeAttribute(m);
            }
          }
          const d = t.currentNodeStyle = Tt(e, f, r, t);
          r && kt(f, t);
          let g = !1;
          if (t.isEnable("copyScrollbar")) {
            const h = [
              (i = d.get("overflow-x")) == null ? void 0 : i[0],
              (l = d.get("overflow-y")) == null ? void 0 : l[1]
            ];
            g = h.includes("scroll") || (h.includes("auto") || h.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
          }
          return Ct(e, f, g, t), vt(e, f), (c = Te((u = d.get("font-family")) == null ? void 0 : u[0])) == null || c.forEach((h) => s.add(h)), M(e) || (yield se(e, f, t)), f;
        }
        const o = e.cloneNode(!1);
        return yield se(e, o, t), o;
      });
    }
    function Dt(e) {
      if (e.ownerDocument = void 0, e.ownerWindow = void 0, e.svgStyleElement = void 0, e.svgDefsElement = void 0, e.svgStyles.clear(), e.defaultComputedStyles.clear(), e.sandbox) {
        try {
          e.sandbox.remove();
        } catch (t) {
        }
        e.sandbox = void 0;
      }
      e.workers = [], e.fontFamilies.clear(), e.fontCssTexts.clear(), e.requests.clear(), e.tasks = [];
    }
    function Ft(e) {
      const i = e, { url: t, timeout: r, responseType: n } = i, a = re(i, ["url", "timeout", "responseType"]), s = new AbortController(), o = r ? setTimeout(() => s.abort(), r) : void 0;
      return fetch(t, T({ signal: s.signal }, a)).then((l) => {
        if (!l.ok)
          throw new Error("Failed fetch, not 2xx response", { cause: l });
        switch (n) {
          case "dataUrl":
            return l.blob().then(lt);
          case "text":
          default:
            return l.text();
        }
      }).finally(() => clearTimeout(o));
    }
    function _(e, t) {
      const { url: r, requestType: n = "text", responseType: a = "text", imageDom: s } = t;
      let o = r;
      const {
        timeout: i,
        acceptOfImage: l,
        requests: u,
        fetchFn: c,
        fetch: {
          requestInit: f,
          bypassingCache: d,
          placeholderImage: g
        },
        workers: h
      } = e;
      n === "image" && (L || X) && e.drawImageCount++;
      let w = u.get(r);
      if (!w) {
        d && d instanceof RegExp && d.test(o) && (o += (/\?/.test(o) ? "&" : "?") + new Date().getTime());
        const y = T({
          url: o,
          timeout: i,
          responseType: a,
          headers: n === "image" ? { accept: l } : void 0
        }, f);
        w = {
          type: n,
          resolve: void 0,
          reject: void 0,
          response: null
        }, w.response = (() => S(this, null, function* () {
          if (c && n === "image") {
            const m = yield c(r);
            if (m)
              return m;
          }
          return !L && r.startsWith("http") && h.length ? new Promise((m, b) => {
            h[u.size & h.length - 1].postMessage(T({ rawUrl: r }, y)), w.resolve = m, w.reject = b;
          }) : Ft(y);
        }))().catch((m) => {
          if (u.delete(r), n === "image" && g)
            return E("Failed to fetch image base64, trying to use placeholder image", o), typeof g == "string" ? g : g(s);
          throw m;
        }), u.set(r, w);
      }
      return w.response;
    }
    function ke(e, t, r, n) {
      return S(this, null, function* () {
        if (!Re(e))
          return e;
        for (const [a, s] of _t(e, t))
          try {
            const o = yield _(
              r,
              {
                url: s,
                requestType: n ? "image" : "text",
                responseType: "dataUrl"
              }
            );
            e = e.replace(Ut(a), `$1${o}$3`);
          } catch (o) {
            E("Failed to fetch css data url", a, o);
          }
        return e;
      });
    }
    function Re(e) {
      return /url\((['"]?)([^'"]+?)\1\)/.test(e);
    }
    const De = /url\((['"]?)([^'"]+?)\1\)/g;
    function _t(e, t) {
      const r = [];
      return e.replace(De, (n, a, s) => (r.push([s, be(s, t)]), n)), r.filter(([n]) => !V(n));
    }
    function Ut(e) {
      const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
      return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
    }
    function Pt(e, t) {
      return S(this, null, function* () {
        const {
          ownerDocument: r,
          svgStyleElement: n,
          fontFamilies: a,
          fontCssTexts: s,
          tasks: o,
          font: i
        } = t;
        if (!(!r || !n || !a.size))
          if (i && i.cssText) {
            const l = ce(i.cssText, t);
            n.appendChild(r.createTextNode(`${l}
`));
          } else {
            const l = Array.from(r.styleSheets).filter((c) => {
              try {
                return "cssRules" in c && Boolean(c.cssRules.length);
              } catch (f) {
                return E(`Error while reading CSS rules from ${c.href}`, f), !1;
              }
            });
            yield Promise.all(
              l.flatMap((c) => Array.from(c.cssRules).map((f, d) => S(this, null, function* () {
                if (Xe(f)) {
                  let g = d + 1;
                  const h = f.href;
                  let w = "";
                  try {
                    w = yield _(t, {
                      url: h,
                      requestType: "text",
                      responseType: "text"
                    });
                  } catch (m) {
                    E(`Error fetch remote css import from ${h}`, m);
                  }
                  const y = w.replace(
                    De,
                    (m, b, p) => m.replace(p, be(p, h))
                  );
                  for (const m of Bt(y))
                    try {
                      c.insertRule(
                        m,
                        m.startsWith("@import") ? g += 1 : c.cssRules.length
                      );
                    } catch (b) {
                      E("Error inserting rule from remote css import", { rule: m, error: b });
                    }
                }
              })))
            ), l.flatMap((c) => Array.from(c.cssRules)).filter((c) => {
              var f;
              return ze(c) && Re(c.style.getPropertyValue("src")) && ((f = Te(c.style.getPropertyValue("font-family"))) == null ? void 0 : f.some((d) => a.has(d)));
            }).forEach((c) => {
              const f = c, d = s.get(f.cssText);
              d ? n.appendChild(r.createTextNode(`${d}
`)) : o.push(
                ke(
                  f.cssText,
                  f.parentStyleSheet ? f.parentStyleSheet.href : null,
                  t
                ).then((g) => {
                  g = ce(g, t), s.set(f.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
                })
              );
            });
          }
      });
    }
    const $t = /(\/\*[\s\S]*?\*\/)/gi, ie = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
    function Bt(e) {
      if (e == null)
        return [];
      const t = [];
      let r = e.replace($t, "");
      for (; ; ) {
        const s = ie.exec(r);
        if (!s)
          break;
        t.push(s[0]);
      }
      r = r.replace(ie, "");
      const n = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, a = new RegExp(
        "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",
        "gi"
      );
      for (; ; ) {
        let s = n.exec(r);
        if (s)
          a.lastIndex = n.lastIndex;
        else if (s = a.exec(r), s)
          n.lastIndex = a.lastIndex;
        else
          break;
        t.push(s[0]);
      }
      return t;
    }
    const Lt = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Mt = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
    function ce(e, t) {
      const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
      return n ? e.replace(Mt, (a) => {
        for (; ; ) {
          const [s, , o] = Lt.exec(a) || [];
          if (!o)
            return "";
          if (o === n)
            return `src: ${s};`;
        }
      }) : e;
    }
    function Ot(e, t) {
      if (D(e)) {
        const r = e.currentSrc || e.src;
        if (!V(r))
          return [
            _(t, {
              url: r,
              imageDom: e,
              requestType: "image",
              responseType: "dataUrl"
            }).then((n) => {
              n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
            })
          ];
        (L || X) && t.drawImageCount++;
      } else if (U(e) && !V(e.href.baseVal)) {
        const r = e.href.baseVal;
        return [
          _(t, {
            url: r,
            imageDom: e,
            requestType: "image",
            responseType: "dataUrl"
          }).then((n) => {
            n && (e.dataset.originalSrc = r, e.href.baseVal = n || "");
          })
        ];
      }
      return [];
    }
    const Wt = [
      "background-image",
      "border-image-source",
      "-webkit-border-image",
      "-webkit-mask-image",
      "list-style-image"
    ];
    function qt(e, t) {
      return Wt.map((r) => {
        const n = e.getPropertyValue(r);
        return !n || n === "none" ? null : ((L || X) && t.drawImageCount++, ke(n, null, t, !0).then((a) => {
          !a || n === a || e.setProperty(
            r,
            a,
            e.getPropertyPriority(r)
          );
        }));
      }).filter(Boolean);
    }
    function jt(e, t) {
      var i;
      const { ownerDocument: r, svgDefsElement: n } = t, a = (i = e.getAttribute("href")) != null ? i : e.getAttribute("xlink:href");
      if (!a)
        return [];
      const [s, o] = a.split("#");
      if (o) {
        const l = `#${o}`, u = r == null ? void 0 : r.querySelector(`svg ${l}`);
        if (s && e.setAttribute("href", l), n != null && n.querySelector(l))
          return [];
        if (u)
          return [
            q(u, t).then((c) => {
              n != null && n.querySelector(l) || n == null || n.appendChild(c);
            })
          ];
        if (s)
          return [
            _(t, {
              url: s,
              responseType: "text"
            }).then((c) => {
              n == null || n.insertAdjacentHTML("beforeend", c);
            })
          ];
      }
      return [];
    }
    function Fe(e, t) {
      const { tasks: r } = t;
      A(e) && ((D(e) || ye(e)) && r.push(...Ot(e, t)), Ge(e) && r.push(...jt(e, t))), G(e) && r.push(...qt(e.style, t)), e.childNodes.forEach((n) => {
        Fe(n, t);
      });
    }
    function Vt(e, t) {
      return S(this, null, function* () {
        const r = yield N(e, t);
        if (A(r.node) && U(r.node))
          return r.node;
        const {
          ownerDocument: n,
          log: a,
          tasks: s,
          svgStyleElement: o,
          svgDefsElement: i,
          svgStyles: l,
          font: u,
          progress: c,
          autoDestruct: f,
          onCloneNode: d,
          onEmbedNode: g,
          onCreateForeignObjectSvg: h
        } = r;
        a.time("clone node");
        const w = yield q(r.node, r, !0);
        if (o && n) {
          let C = "";
          l.forEach((v, I) => {
            C += `${v.join(`,
`)} {
  ${I}
}
`;
          }), o.appendChild(n.createTextNode(C));
        }
        a.timeEnd("clone node"), d == null || d(w), u !== !1 && A(w) && (a.time("embed web font"), yield Pt(w, r), a.timeEnd("embed web font")), a.time("embed node"), Fe(w, r);
        const y = s.length;
        let m = 0;
        const b = () => S(this, null, function* () {
          for (; ; ) {
            const C = s.pop();
            if (!C)
              break;
            try {
              yield C;
            } catch (v) {
              E("Failed to run task", v);
            }
            c == null || c(++m, y);
          }
        });
        c == null || c(m, y), yield Promise.all([...Array(4)].map(b)), a.timeEnd("embed node"), g == null || g(w);
        const p = Ht(w, r);
        return i && p.insertBefore(i, p.children[0]), o && p.insertBefore(o, p.children[0]), f && Dt(r), h == null || h(p), p;
      });
    }
    function Ht(e, t) {
      const { width: r, height: n } = t, a = Se(r, n, e.ownerDocument), s = a.ownerDocument.createElementNS(a.namespaceURI, "foreignObject");
      return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), a.appendChild(s), a;
    }
    function Y(e, t) {
      return S(this, null, function* () {
        var o;
        const r = yield N(e, t), n = yield Vt(r), a = Ee(n, r.isEnable("removeControlCharacter"));
        r.autoDestruct || (r.svgStyleElement = Ae(r.ownerDocument), r.svgDefsElement = (o = r.ownerDocument) == null ? void 0 : o.createElementNS(W, "defs"), r.svgStyles.clear());
        const s = k(a, n.ownerDocument);
        return yield wt(s, r);
      });
    }
    function Gt(e, t) {
      return S(this, null, function* () {
        const r = yield N(e, t), { log: n, type: a, quality: s, dpi: o } = r, i = yield Y(r);
        n.time("canvas to blob");
        const l = yield it(i, a, s);
        if (["image/png", "image/jpeg"].includes(a) && o) {
          const u = yield ut(l.slice(0, 33));
          let c = new Uint8Array(u);
          return a === "image/png" ? c = he(c, o) : a === "image/jpeg" && (c = ue(c, o)), n.timeEnd("canvas to blob"), new Blob([c, l.slice(33)], { type: a });
        }
        return n.timeEnd("canvas to blob"), l;
      });
    }

    // MIDIFileHeader : Read and edit a MIDI header chunk in a given ArrayBuffer
    function MIDIFileHeader(buffer) {
      let a;
      // No buffer creating him
      if (!buffer) {
        a = new Uint8Array(MIDIFileHeader.HEADER_LENGTH);
        // Adding the header id (MThd)
        a[0] = 0x4d;
        a[1] = 0x54;
        a[2] = 0x68;
        a[3] = 0x64;
        // Adding the header chunk size
        a[4] = 0x00;
        a[5] = 0x00;
        a[6] = 0x00;
        a[7] = 0x06;
        // Adding the file format (1 here cause it's the most commonly used)
        a[8] = 0x00;
        a[9] = 0x01;
        // Adding the track count (1 cause it's a new file)
        a[10] = 0x00;
        a[11] = 0x01;
        // Adding the time division (192 ticks per beat)
        a[12] = 0x00;
        a[13] = 0xc0;
        // saving the buffer
        this.datas = new DataView(a.buffer, 0, MIDIFileHeader.HEADER_LENGTH);
        // Parsing the given buffer
      } else {
        if (!(buffer instanceof ArrayBuffer)) {
          throw Error('Invalid buffer received.');
        }
        this.datas = new DataView(buffer, 0, MIDIFileHeader.HEADER_LENGTH);
        // Reading MIDI header chunk
        if (
          !(
            'M' === String.fromCharCode(this.datas.getUint8(0)) &&
            'T' === String.fromCharCode(this.datas.getUint8(1)) &&
            'h' === String.fromCharCode(this.datas.getUint8(2)) &&
            'd' === String.fromCharCode(this.datas.getUint8(3))
          )
        ) {
          throw new Error('Invalid MIDIFileHeader : MThd prefix not found');
        }
        // Reading chunk length
        if (6 !== this.datas.getUint32(4)) {
          throw new Error('Invalid MIDIFileHeader : Chunk length must be 6');
        }
      }
    }

    // Static constants
    MIDIFileHeader.HEADER_LENGTH = 14;
    MIDIFileHeader.FRAMES_PER_SECONDS = 1;
    MIDIFileHeader.TICKS_PER_BEAT = 2;

    // MIDI file format
    MIDIFileHeader.prototype.getFormat = function() {
      const format = this.datas.getUint16(8);
      if (0 !== format && 1 !== format && 2 !== format) {
        throw new Error(
          'Invalid MIDI file : MIDI format (' +
            format +
            '),' +
            ' format can be 0, 1 or 2 only.'
        );
      }
      return format;
    };

    MIDIFileHeader.prototype.setFormat = function(format) {
      if (0 !== format && 1 !== format && 2 !== format) {
        throw new Error(
          'Invalid MIDI format given (' +
            format +
            '),' +
            ' format can be 0, 1 or 2 only.'
        );
      }
      this.datas.setUint16(8, format);
    };

    // Number of tracks
    MIDIFileHeader.prototype.getTracksCount = function() {
      return this.datas.getUint16(10);
    };

    MIDIFileHeader.prototype.setTracksCount = function(n) {
      return this.datas.setUint16(10, n);
    };

    // Tick compute
    MIDIFileHeader.prototype.getTickResolution = function(tempo) {
      // Frames per seconds
      if (this.datas.getUint16(12) & 0x8000) {
        return 1000000 / (this.getSMPTEFrames() * this.getTicksPerFrame());
        // Ticks per beat
      }
      // Default MIDI tempo is 120bpm, 500ms per beat
      tempo = tempo || 500000;
      return tempo / this.getTicksPerBeat();
    };

    // Time division type
    MIDIFileHeader.prototype.getTimeDivision = function() {
      if (this.datas.getUint16(12) & 0x8000) {
        return MIDIFileHeader.FRAMES_PER_SECONDS;
      }
      return MIDIFileHeader.TICKS_PER_BEAT;
    };

    // Ticks per beat
    MIDIFileHeader.prototype.getTicksPerBeat = function() {
      var divisionWord = this.datas.getUint16(12);
      if (divisionWord & 0x8000) {
        throw new Error('Time division is not expressed as ticks per beat.');
      }
      return divisionWord;
    };

    MIDIFileHeader.prototype.setTicksPerBeat = function(ticksPerBeat) {
      this.datas.setUint16(12, ticksPerBeat & 0x7fff);
    };

    // Frames per seconds
    MIDIFileHeader.prototype.getSMPTEFrames = function() {
      const divisionWord = this.datas.getUint16(12);
      let smpteFrames;

      if (!(divisionWord & 0x8000)) {
        throw new Error('Time division is not expressed as frames per seconds.');
      }
      smpteFrames = divisionWord & 0x7f00;
      if (-1 === [24, 25, 29, 30].indexOf(smpteFrames)) {
        throw new Error('Invalid SMPTE frames value (' + smpteFrames + ').');
      }
      return 29 === smpteFrames ? 29.97 : smpteFrames;
    };

    MIDIFileHeader.prototype.getTicksPerFrame = function() {
      const divisionWord = this.datas.getUint16(12);

      if (!(divisionWord & 0x8000)) {
        throw new Error('Time division is not expressed as frames per seconds.');
      }
      return divisionWord & 0x00ff;
    };

    MIDIFileHeader.prototype.setSMTPEDivision = function(
      smpteFrames,
      ticksPerFrame
    ) {
      if (29.97 === smpteFrames) {
        smpteFrames = 29;
      }
      if (-1 === [24, 25, 29, 30].indexOf(smpteFrames)) {
        throw new Error('Invalid SMPTE frames value given (' + smpteFrames + ').');
      }
      if (0 > ticksPerFrame || 0xff < ticksPerFrame) {
        throw new Error(
          'Invalid ticks per frame value given (' + smpteFrames + ').'
        );
      }
      this.datas.setUint8(12, 0x80 | smpteFrames);
      this.datas.setUint8(13, ticksPerFrame);
    };

    var MIDIFileHeader_1 = MIDIFileHeader;

    // MIDIFileTrack : Read and edit a MIDI track chunk in a given ArrayBuffer
    function MIDIFileTrack(buffer, start) {
      let a;
      let trackLength;

      // no buffer, creating him
      if (!buffer) {
        a = new Uint8Array(12);
        // Adding the empty track header (MTrk)
        a[0] = 0x4d;
        a[1] = 0x54;
        a[2] = 0x72;
        a[3] = 0x6b;
        // Adding the empty track size (4)
        a[4] = 0x00;
        a[5] = 0x00;
        a[6] = 0x00;
        a[7] = 0x04;
        // Adding the track end event
        a[8] = 0x00;
        a[9] = 0xff;
        a[10] = 0x2f;
        a[11] = 0x00;
        // Saving the buffer
        this.datas = new DataView(a.buffer, 0, MIDIFileTrack.HDR_LENGTH + 4);
        // parsing the given buffer
      } else {
        if (!(buffer instanceof ArrayBuffer)) {
          throw new Error('Invalid buffer received.');
        }
        // Buffer length must size at least like an  empty track (8+3bytes)
        if (12 > buffer.byteLength - start) {
          throw new Error(
            'Invalid MIDIFileTrack (0x' +
              start.toString(16) +
              ') :' +
              ' Buffer length must size at least 12bytes'
          );
        }
        // Creating a temporary view to read the track header
        this.datas = new DataView(buffer, start, MIDIFileTrack.HDR_LENGTH);
        // Reading MIDI track header chunk
        if (
          !(
            'M' === String.fromCharCode(this.datas.getUint8(0)) &&
            'T' === String.fromCharCode(this.datas.getUint8(1)) &&
            'r' === String.fromCharCode(this.datas.getUint8(2)) &&
            'k' === String.fromCharCode(this.datas.getUint8(3))
          )
        ) {
          throw new Error(
            'Invalid MIDIFileTrack (0x' +
              start.toString(16) +
              ') :' +
              ' MTrk prefix not found'
          );
        }
        // Reading the track length
        trackLength = this.getTrackLength();
        if (buffer.byteLength - start < trackLength) {
          throw new Error(
            'Invalid MIDIFileTrack (0x' +
              start.toString(16) +
              ') :' +
              ' The track size exceed the buffer length.'
          );
        }
        // Creating the final DataView
        this.datas = new DataView(
          buffer,
          start,
          MIDIFileTrack.HDR_LENGTH + trackLength
        );
        // Trying to find the end of track event
        if (
          !(
            0xff ===
              this.datas.getUint8(MIDIFileTrack.HDR_LENGTH + (trackLength - 3)) &&
            0x2f ===
              this.datas.getUint8(MIDIFileTrack.HDR_LENGTH + (trackLength - 2)) &&
            0x00 ===
              this.datas.getUint8(MIDIFileTrack.HDR_LENGTH + (trackLength - 1))
          )
        ) {
          throw new Error(
            'Invalid MIDIFileTrack (0x' +
              start.toString(16) +
              ') :' +
              ' No track end event found at the expected index' +
              ' (' +
              (MIDIFileTrack.HDR_LENGTH + (trackLength - 1)).toString(16) +
              ').'
          );
        }
      }
    }

    // Static constants
    MIDIFileTrack.HDR_LENGTH = 8;

    // Track length
    MIDIFileTrack.prototype.getTrackLength = function() {
      return this.datas.getUint32(4);
    };

    MIDIFileTrack.prototype.setTrackLength = function(trackLength) {
      return this.datas.setUint32(4, trackLength);
    };

    // Read track contents
    MIDIFileTrack.prototype.getTrackContent = function() {
      return new DataView(
        this.datas.buffer,
        this.datas.byteOffset + MIDIFileTrack.HDR_LENGTH,
        this.datas.byteLength - MIDIFileTrack.HDR_LENGTH
      );
    };

    // Set track content
    MIDIFileTrack.prototype.setTrackContent = function(dataView) {
      let origin;
      let destination;
      let i;
      let j;
      // Calculating the track length
      const trackLength = dataView.byteLength - dataView.byteOffset;

      // Track length must size at least like an  empty track (4bytes)
      if (4 > trackLength) {
        throw new Error('Invalid track length, must size at least 4bytes');
      }
      this.datas = new DataView(
        new Uint8Array(MIDIFileTrack.HDR_LENGTH + trackLength).buffer
      );
      // Adding the track header (MTrk)
      this.datas.setUint8(0, 0x4d); // M
      this.datas.setUint8(1, 0x54); // T
      this.datas.setUint8(2, 0x72); // r
      this.datas.setUint8(3, 0x6b); // k
      // Adding the track size
      this.datas.setUint32(4, trackLength);
      // Copying the content
      origin = new Uint8Array(
        dataView.buffer,
        dataView.byteOffset,
        dataView.byteLength
      );
      destination = new Uint8Array(
        this.datas.buffer,
        MIDIFileTrack.HDR_LENGTH,
        trackLength
      );
      for (i = 0, j = origin.length; i < j; i++) {
        destination[i] = origin[i];
      }
    };

    var MIDIFileTrack_1 = MIDIFileTrack;

    // MIDIEvents : Read and edit events from various sources (ArrayBuffer, Stream)
    function MIDIEvents() {
      throw new Error('MIDIEvents function not intended to be run.');
    }

    // Static constants
    // Event types
    MIDIEvents.EVENT_META = 0xff;
    MIDIEvents.EVENT_SYSEX = 0xf0;
    MIDIEvents.EVENT_DIVSYSEX = 0xf7;
    MIDIEvents.EVENT_MIDI = 0x8;
    // Meta event types
    MIDIEvents.EVENT_META_SEQUENCE_NUMBER = 0x00;
    MIDIEvents.EVENT_META_TEXT = 0x01;
    MIDIEvents.EVENT_META_COPYRIGHT_NOTICE = 0x02;
    MIDIEvents.EVENT_META_TRACK_NAME = 0x03;
    MIDIEvents.EVENT_META_INSTRUMENT_NAME = 0x04;
    MIDIEvents.EVENT_META_LYRICS = 0x05;
    MIDIEvents.EVENT_META_MARKER = 0x06;
    MIDIEvents.EVENT_META_CUE_POINT = 0x07;
    MIDIEvents.EVENT_META_MIDI_CHANNEL_PREFIX = 0x20;
    MIDIEvents.EVENT_META_END_OF_TRACK = 0x2f;
    MIDIEvents.EVENT_META_SET_TEMPO = 0x51;
    MIDIEvents.EVENT_META_SMTPE_OFFSET = 0x54;
    MIDIEvents.EVENT_META_TIME_SIGNATURE = 0x58;
    MIDIEvents.EVENT_META_KEY_SIGNATURE = 0x59;
    MIDIEvents.EVENT_META_SEQUENCER_SPECIFIC = 0x7f;
    // MIDI event types
    MIDIEvents.EVENT_MIDI_NOTE_OFF = 0x8;
    MIDIEvents.EVENT_MIDI_NOTE_ON = 0x9;
    MIDIEvents.EVENT_MIDI_NOTE_AFTERTOUCH = 0xa;
    MIDIEvents.EVENT_MIDI_CONTROLLER = 0xb;
    MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE = 0xc;
    MIDIEvents.EVENT_MIDI_CHANNEL_AFTERTOUCH = 0xd;
    MIDIEvents.EVENT_MIDI_PITCH_BEND = 0xe;
    // MIDI event sizes
    MIDIEvents.MIDI_1PARAM_EVENTS = [
      MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE,
      MIDIEvents.EVENT_MIDI_CHANNEL_AFTERTOUCH,
    ];
    MIDIEvents.MIDI_2PARAMS_EVENTS = [
      MIDIEvents.EVENT_MIDI_NOTE_OFF,
      MIDIEvents.EVENT_MIDI_NOTE_ON,
      MIDIEvents.EVENT_MIDI_NOTE_AFTERTOUCH,
      MIDIEvents.EVENT_MIDI_CONTROLLER,
      MIDIEvents.EVENT_MIDI_PITCH_BEND,
    ];

    // Create an event stream parser
    MIDIEvents.createParser = function midiEventsCreateParser(
      stream,
      startAt,
      strictMode
    ) {
      // Private vars
      // Common vars
      var eventTypeByte;
      var event;
      // MIDI events vars
      var MIDIEventType;
      var MIDIEventChannel;
      var MIDIEventParam1;

      // Wrap DataView into a data stream
      if (stream instanceof DataView) {
        stream = {
          position: startAt || 0,
          buffer: stream,
          readUint8: function() {
            return this.buffer.getUint8(this.position++);
          },
          readUint16: function() {
            var v = this.buffer.getUint16(this.position);
            this.position = this.position + 2;
            return v;
          },
          readUint32: function() {
            var v = this.buffer.getUint16(this.position);
            this.position = this.position + 2;
            return v;
          },
          readVarInt: function() {
            var v = 0;
            var i = 0;
            var b;

            while (4 > i++) {
              b = this.readUint8();

              if (b & 0x80) {
                v += b & 0x7f;
                v <<= 7;
              } else {
                return v + b;
              }
            }
            throw new Error(
              '0x' +
                this.position.toString(16) +
                ':' +
                ' Variable integer length cannot exceed 4 bytes'
            );
          },
          readBytes: function(length) {
            var bytes = [];

            for (; 0 < length; length--) {
              bytes.push(this.readUint8());
            }
            return bytes;
          },
          pos: function() {
            return '0x' + (this.buffer.byteOffset + this.position).toString(16);
          },
          end: function() {
            return this.position === this.buffer.byteLength;
          },
        };
        startAt = 0;
      }
      // Consume stream till not at start index
      if (0 < startAt) {
        while (startAt--) {
          stream.readUint8();
        }
      }
      // creating the parser object
      return {
        // Read the next event
        next: function() {
          // Check available datas
          if (stream.end()) {
            return null;
          }
          // Creating the event
          event = {
            // Memoize the event index
            index: stream.pos(),
            // Read the delta time
            delta: stream.readVarInt(),
          };
          // Read the eventTypeByte
          eventTypeByte = stream.readUint8();
          if (0xf0 === (eventTypeByte & 0xf0)) {
            // Meta events
            if (eventTypeByte === MIDIEvents.EVENT_META) {
              event.type = MIDIEvents.EVENT_META;
              event.subtype = stream.readUint8();
              event.length = stream.readVarInt();
              switch (event.subtype) {
                case MIDIEvents.EVENT_META_SEQUENCE_NUMBER:
                  if (strictMode && 2 !== event.length) {
                    throw new Error(stream.pos() + ' Bad metaevent length.');
                  }
                  event.msb = stream.readUint8();
                  event.lsb = stream.readUint8();
                  return event;
                case MIDIEvents.EVENT_META_TEXT:
                case MIDIEvents.EVENT_META_COPYRIGHT_NOTICE:
                case MIDIEvents.EVENT_META_TRACK_NAME:
                case MIDIEvents.EVENT_META_INSTRUMENT_NAME:
                case MIDIEvents.EVENT_META_LYRICS:
                case MIDIEvents.EVENT_META_MARKER:
                case MIDIEvents.EVENT_META_CUE_POINT:
                  event.data = stream.readBytes(event.length);
                  return event;
                case MIDIEvents.EVENT_META_MIDI_CHANNEL_PREFIX:
                  if (strictMode && 1 !== event.length) {
                    throw new Error(stream.pos() + ' Bad metaevent length.');
                  }
                  event.prefix = stream.readUint8();
                  return event;
                case MIDIEvents.EVENT_META_END_OF_TRACK:
                  if (strictMode && 0 !== event.length) {
                    throw new Error(stream.pos() + ' Bad metaevent length.');
                  }
                  return event;
                case MIDIEvents.EVENT_META_SET_TEMPO:
                  if (strictMode && 3 !== event.length) {
                    throw new Error(
                      stream.pos() + ' Tempo meta event length must be 3.'
                    );
                  }
                  event.tempo =
                    (stream.readUint8() << 16) +
                    (stream.readUint8() << 8) +
                    stream.readUint8();
                  event.tempoBPM = 60000000 / event.tempo;
                  return event;
                case MIDIEvents.EVENT_META_SMTPE_OFFSET:
                  if (strictMode && 5 !== event.length) {
                    throw new Error(stream.pos() + ' Bad metaevent length.');
                  }
                  event.hour = stream.readUint8();
                  if (strictMode && 23 < event.hour) {
                    throw new Error(
                      stream.pos() +
                        ' SMTPE offset hour value must' +
                        ' be part of 0-23.'
                    );
                  }
                  event.minutes = stream.readUint8();
                  if (strictMode && 59 < event.minutes) {
                    throw new Error(
                      stream.pos() +
                        ' SMTPE offset minutes value' +
                        ' must be part of 0-59.'
                    );
                  }
                  event.seconds = stream.readUint8();
                  if (strictMode && 59 < event.seconds) {
                    throw new Error(
                      stream.pos() +
                        ' SMTPE offset seconds value' +
                        ' must be part of 0-59.'
                    );
                  }
                  event.frames = stream.readUint8();
                  if (strictMode && 30 < event.frames) {
                    throw new Error(
                      stream.pos() +
                        ' SMTPE offset frames value must' +
                        ' be part of 0-30.'
                    );
                  }
                  event.subframes = stream.readUint8();
                  if (strictMode && 99 < event.subframes) {
                    throw new Error(
                      stream.pos() +
                        ' SMTPE offset subframes value' +
                        ' must be part of 0-99.'
                    );
                  }
                  return event;
                case MIDIEvents.EVENT_META_KEY_SIGNATURE:
                  if (strictMode && 2 !== event.length) {
                    throw new Error(stream.pos() + ' Bad metaevent length.');
                  }
                  event.key = stream.readUint8();
                  if (strictMode && (-7 > event.key || 7 < event.key)) {
                    throw new Error(stream.pos() + ' Bad metaevent length.');
                  }
                  event.scale = stream.readUint8();
                  if (strictMode && 0 !== event.scale && 1 !== event.scale) {
                    throw new Error(
                      stream.pos() +
                        ' Key signature scale value must' +
                        ' be 0 or 1.'
                    );
                  }
                  return event;
                case MIDIEvents.EVENT_META_TIME_SIGNATURE:
                  if (strictMode && 4 !== event.length) {
                    throw new Error(stream.pos() + ' Bad metaevent length.');
                  }
                  event.data = stream.readBytes(event.length);
                  event.param1 = event.data[0];
                  event.param2 = event.data[1];
                  event.param3 = event.data[2];
                  event.param4 = event.data[3];
                  return event;
                case MIDIEvents.EVENT_META_SEQUENCER_SPECIFIC:
                  event.data = stream.readBytes(event.length);
                  return event;
                default:
                  if (strictMode) {
                    throw new Error(
                      stream.pos() +
                        ' Unknown meta event type ' +
                        '(' +
                        event.subtype.toString(16) +
                        ').'
                    );
                  }
                  event.data = stream.readBytes(event.length);
                  return event;
              }
              // System events
            } else if (
              eventTypeByte === MIDIEvents.EVENT_SYSEX ||
              eventTypeByte === MIDIEvents.EVENT_DIVSYSEX
            ) {
              event.type = eventTypeByte;
              event.length = stream.readVarInt();
              event.data = stream.readBytes(event.length);
              return event;
              // Unknown event, assuming it's system like event
            } else {
              if (strictMode) {
                throw new Error(
                  stream.pos() +
                    ' Unknown event type ' +
                    eventTypeByte.toString(16) +
                    ', Delta: ' +
                    event.delta +
                    '.'
                );
              }
              event.type = eventTypeByte;
              event.badsubtype = stream.readVarInt();
              event.length = stream.readUint8();
              event.data = stream.readBytes(event.length);
              return event;
            }
            // MIDI eventsdestination[index++]
          } else {
            // running status
            if (0 === (eventTypeByte & 0x80)) {
              if (!MIDIEventType) {
                throw new Error(
                  stream.pos() + ' Running status without previous event'
                );
              }
              MIDIEventParam1 = eventTypeByte;
            } else {
              MIDIEventType = eventTypeByte >> 4;
              MIDIEventChannel = eventTypeByte & 0x0f;
              MIDIEventParam1 = stream.readUint8();
            }
            event.type = MIDIEvents.EVENT_MIDI;
            event.subtype = MIDIEventType;
            event.channel = MIDIEventChannel;
            event.param1 = MIDIEventParam1;
            switch (MIDIEventType) {
              case MIDIEvents.EVENT_MIDI_NOTE_OFF:
                event.param2 = stream.readUint8();
                return event;
              case MIDIEvents.EVENT_MIDI_NOTE_ON:
                event.param2 = stream.readUint8();

                // If velocity is 0, it's a note off event in fact
                if (!event.param2) {
                  event.subtype = MIDIEvents.EVENT_MIDI_NOTE_OFF;
                  event.param2 = 127; // Find a standard telling what to do here
                }
                return event;
              case MIDIEvents.EVENT_MIDI_NOTE_AFTERTOUCH:
                event.param2 = stream.readUint8();
                return event;
              case MIDIEvents.EVENT_MIDI_CONTROLLER:
                event.param2 = stream.readUint8();
                return event;
              case MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE:
                return event;
              case MIDIEvents.EVENT_MIDI_CHANNEL_AFTERTOUCH:
                return event;
              case MIDIEvents.EVENT_MIDI_PITCH_BEND:
                event.param2 = stream.readUint8();
                return event;
              default:
                if (strictMode) {
                  throw new Error(
                    stream.pos() +
                      ' Unknown MIDI event type ' +
                      '(' +
                      MIDIEventType.toString(16) +
                      ').'
                  );
                }
                return event;
            }
          }
        },
      };
    };

    // Return the buffer length needed to encode the given events
    MIDIEvents.writeToTrack = function midiEventsWriteToTrack(
      events,
      destination,
      strictMode
    ) {
      var index = 0;
      var i;
      var j;
      var k;
      var l;

      // Converting each event to binary MIDI datas
      for (i = 0, j = events.length; i < j; i++) {
        // Writing delta value
        if (events[i].delta >>> 28) {
          throw Error(
            'Event #' +
              i +
              ': Maximum delta time value reached (' +
              events[i].delta +
              '/134217728 max)'
          );
        }
        if (events[i].delta >>> 21) {
          destination[index++] = ((events[i].delta >>> 21) & 0x7f) | 0x80;
        }
        if (events[i].delta >>> 14) {
          destination[index++] = ((events[i].delta >>> 14) & 0x7f) | 0x80;
        }
        if (events[i].delta >>> 7) {
          destination[index++] = ((events[i].delta >>> 7) & 0x7f) | 0x80;
        }
        destination[index++] = events[i].delta & 0x7f;
        // MIDI Events encoding
        if (events[i].type === MIDIEvents.EVENT_MIDI) {
          // Adding the byte of subtype + channel
          destination[index++] = (events[i].subtype << 4) + events[i].channel;
          // Adding the byte of the first params
          destination[index++] = events[i].param1;
          // Adding a byte for the optionnal second param
          if (-1 !== MIDIEvents.MIDI_2PARAMS_EVENTS.indexOf(events[i].subtype)) {
            destination[index++] = events[i].param2;
          }
          // META / SYSEX events encoding
        } else {
          // Adding the event type byte
          destination[index++] = events[i].type;
          // Adding the META event subtype byte
          if (events[i].type === MIDIEvents.EVENT_META) {
            destination[index++] = events[i].subtype;
          }
          // Writing the event length bytes
          if (events[i].length >>> 28) {
            throw Error(
              'Event #' +
                i +
                ': Maximum length reached (' +
                events[i].length +
                '/134217728 max)'
            );
          }
          if (events[i].length >>> 21) {
            destination[index++] = ((events[i].length >>> 21) & 0x7f) | 0x80;
          }
          if (events[i].length >>> 14) {
            destination[index++] = ((events[i].length >>> 14) & 0x7f) | 0x80;
          }
          if (events[i].length >>> 7) {
            destination[index++] = ((events[i].length >>> 7) & 0x7f) | 0x80;
          }
          destination[index++] = events[i].length & 0x7f;
          if (events[i].type === MIDIEvents.EVENT_META) {
            switch (events[i].subtype) {
              case MIDIEvents.EVENT_META_SEQUENCE_NUMBER:
                destination[index++] = events[i].msb;
                destination[index++] = events[i].lsb;
                break;
              case MIDIEvents.EVENT_META_TEXT:
              case MIDIEvents.EVENT_META_COPYRIGHT_NOTICE:
              case MIDIEvents.EVENT_META_TRACK_NAME:
              case MIDIEvents.EVENT_META_INSTRUMENT_NAME:
              case MIDIEvents.EVENT_META_LYRICS:
              case MIDIEvents.EVENT_META_MARKER:
              case MIDIEvents.EVENT_META_CUE_POINT:
                for (k = 0, l = events[i].length; k < l; k++) {
                  destination[index++] = events[i].data[k];
                }
                break;
              case MIDIEvents.EVENT_META_MIDI_CHANNEL_PREFIX:
                destination[index++] = events[i].prefix;
                break;
              case MIDIEvents.EVENT_META_END_OF_TRACK:
                break;
              case MIDIEvents.EVENT_META_SET_TEMPO:
                destination[index++] = events[i].tempo >> 16;
                destination[index++] = (events[i].tempo >> 8) & 0xff;
                destination[index++] = events[i].tempo & 0xff;
                break;
              case MIDIEvents.EVENT_META_SMTPE_OFFSET:
                if (strictMode && 23 < events[i].hour) {
                  throw new Error(
                    'Event #' +
                      i +
                      ': SMTPE offset hour value must be' +
                      ' part of 0-23.'
                  );
                }
                destination[index++] = events[i].hour;
                if (strictMode && 59 < events[i].minutes) {
                  throw new Error(
                    'Event #' +
                      i +
                      ': SMTPE offset minutes value must' +
                      ' be part of 0-59.'
                  );
                }
                destination[index++] = events[i].minutes;
                if (strictMode && 59 < events[i].seconds) {
                  throw new Error(
                    'Event #' +
                      i +
                      ': SMTPE offset seconds value must' +
                      ' be part of 0-59.'
                  );
                }
                destination[index++] = events[i].seconds;
                if (strictMode && 30 < events[i].frames) {
                  throw new Error(
                    'Event #' +
                      i +
                      ': SMTPE offset frames amount must' +
                      ' be part of 0-30.'
                  );
                }
                destination[index++] = events[i].frames;
                if (strictMode && 99 < events[i].subframes) {
                  throw new Error(
                    'Event #' +
                      i +
                      ': SMTPE offset subframes amount' +
                      ' must be part of 0-99.'
                  );
                }
                destination[index++] = events[i].subframes;
                break;
              case MIDIEvents.EVENT_META_KEY_SIGNATURE:
                if (
                  'number' != typeof events[i].key ||
                  -7 > events[i].key ||
                  7 < events[i].scale
                ) {
                  throw new Error(
                    'Event #' +
                      i +
                      ':The key signature key must be' +
                      ' between -7 and 7'
                  );
                }
                if (
                  'number' !== typeof events[i].scale ||
                  0 > events[i].scale ||
                  1 < events[i].scale
                ) {
                  throw new Error(
                    'Event #' + i + ':' + 'The key signature scale must be 0 or 1'
                  );
                }
                destination[index++] = events[i].key;
                destination[index++] = events[i].scale;
                break;
              // Not implemented
              case MIDIEvents.EVENT_META_TIME_SIGNATURE:
              case MIDIEvents.EVENT_META_SEQUENCER_SPECIFIC:
              default:
                for (k = 0, l = events[i].length; k < l; k++) {
                  destination[index++] = events[i].data[k];
                }
                break;
            }
            // Adding bytes corresponding to the sysex event datas
          } else {
            for (k = 0, l = events[i].length; k < l; k++) {
              destination[index++] = events[i].data[k];
            }
          }
        }
      }
    };

    // Return the buffer length needed to encode the given events
    MIDIEvents.getRequiredBufferLength = function(events) {
      var bufferLength = 0;
      var i = 0;
      var j;

      // Calculating the track size by adding events lengths
      for (i = 0, j = events.length; i < j; i++) {
        // Computing necessary bytes to encode the delta value
        bufferLength +=
          events[i].delta >>> 21
            ? 4
            : events[i].delta >>> 14
              ? 3
              : events[i].delta >>> 7
                ? 2
                : 1;
        // MIDI Events have various fixed lengths
        if (events[i].type === MIDIEvents.EVENT_MIDI) {
          // Adding a byte for subtype + channel
          bufferLength++;
          // Adding a byte for the first params
          bufferLength++;
          // Adding a byte for the optionnal second param
          if (-1 !== MIDIEvents.MIDI_2PARAMS_EVENTS.indexOf(events[i].subtype)) {
            bufferLength++;
          }
          // META / SYSEX events lengths are self defined
        } else {
          // Adding a byte for the event type
          bufferLength++;
          // Adding a byte for META events subtype
          if (events[i].type === MIDIEvents.EVENT_META) {
            bufferLength++;
          }
          // Adding necessary bytes to encode the length
          bufferLength +=
            events[i].length >>> 21
              ? 4
              : events[i].length >>> 14
                ? 3
                : events[i].length >>> 7
                  ? 2
                  : 1;
          // Adding bytes corresponding to the event length
          bufferLength += events[i].length;
        }
      }
      return bufferLength;
    };

    var MIDIEvents_1 = MIDIEvents;

    var UTF8 = {
      isNotUTF8: isNotUTF8,
      getCharLength: getCharLength,
      getCharCode: getCharCode,
      getStringFromBytes: getStringFromBytes,
      getBytesForCharCode: getBytesForCharCode,
      setBytesFromCharCode: setBytesFromCharCode,
      setBytesFromString: setBytesFromString,
    };

    // non UTF8 encoding detection (cf README file for details)
    function isNotUTF8(bytes, byteOffset, byteLength) {
      try {
        getStringFromBytes(bytes, byteOffset, byteLength, true);
      } catch (e) {
        return true;
      }
      return false;
    }

    function getCharLength(theByte) {
      // 4 bytes encoded char (mask 11110000)
      if (0xf0 == (theByte & 0xf0)) {
        return 4;
        // 3 bytes encoded char (mask 11100000)
      } else if (0xe0 == (theByte & 0xe0)) {
        return 3;
        // 2 bytes encoded char (mask 11000000)
      } else if (0xc0 == (theByte & 0xc0)) {
        return 2;
        // 1 bytes encoded char
      } else if (theByte == (theByte & 0x7f)) {
        return 1;
      }
      return 0;
    }

    // UTF8 decoding functions
    function getCharCode(bytes, byteOffset, charLength) {
      var charCode = 0,
        mask = '';
      byteOffset = byteOffset || 0;
      // validate that the array has at least one byte in it
      if (bytes.length - byteOffset <= 0) {
        throw new Error('No more characters remaining in array.');
      }
      // Retrieve charLength if not given
      charLength = charLength || getCharLength(bytes[byteOffset]);
      if (charLength == 0) {
        throw new Error(
          bytes[byteOffset].toString(2) +
            ' is not a significative' +
            ' byte (offset:' +
            byteOffset +
            ').'
        );
      }
      // Return byte value if charlength is 1
      if (1 === charLength) {
        return bytes[byteOffset];
      }
      // validate that the array has enough bytes to make up this character
      if (bytes.length - byteOffset < charLength) {
        throw new Error(
          'Expected at least ' + charLength + ' bytes remaining in array.'
        );
      }
      // Test UTF8 integrity
      mask = '00000000'.slice(0, charLength) + 1 + '00000000'.slice(charLength + 1);
      if (bytes[byteOffset] & parseInt(mask, 2)) {
        throw Error(
          'Index ' +
            byteOffset +
            ': A ' +
            charLength +
            ' bytes' +
            ' encoded char' +
            ' cannot encode the ' +
            (charLength + 1) +
            'th rank bit to 1.'
        );
      }
      // Reading the first byte
      mask = '0000'.slice(0, charLength + 1) + '11111111'.slice(charLength + 1);
      charCode += (bytes[byteOffset] & parseInt(mask, 2)) << (--charLength * 6);
      // Reading the next bytes
      while (charLength) {
        if (
          0x80 !== (bytes[byteOffset + 1] & 0x80) ||
          0x40 === (bytes[byteOffset + 1] & 0x40)
        ) {
          throw Error(
            'Index ' +
              (byteOffset + 1) +
              ': Next bytes of encoded char' +
              ' must begin with a "10" bit sequence.'
          );
        }
        charCode += (bytes[++byteOffset] & 0x3f) << (--charLength * 6);
      }
      return charCode;
    }

    function getStringFromBytes(bytes, byteOffset, byteLength, strict) {
      var charLength,
        chars = [];
      byteOffset = byteOffset | 0;
      byteLength =
        'number' === typeof byteLength
          ? byteLength
          : bytes.byteLength || bytes.length;
      for (; byteOffset < byteLength; byteOffset++) {
        charLength = getCharLength(bytes[byteOffset]);
        if (byteOffset + charLength > byteLength) {
          if (strict) {
            throw Error(
              'Index ' +
                byteOffset +
                ': Found a ' +
                charLength +
                ' bytes encoded char declaration but only ' +
                (byteLength - byteOffset) +
                ' bytes are available.'
            );
          }
        } else {
          chars.push(
            String.fromCodePoint(getCharCode(bytes, byteOffset, charLength))
          );
        }
        byteOffset += charLength - 1;
      }
      return chars.join('');
    }

    // UTF8 encoding functions
    function getBytesForCharCode(charCode) {
      if (charCode < 128) {
        return 1;
      } else if (charCode < 2048) {
        return 2;
      } else if (charCode < 65536) {
        return 3;
      } else if (charCode < 2097152) {
        return 4;
      }
      throw new Error('CharCode ' + charCode + ' cannot be encoded with UTF8.');
    }

    function setBytesFromCharCode(charCode, bytes, byteOffset, neededBytes) {
      charCode = charCode | 0;
      bytes = bytes || [];
      byteOffset = byteOffset | 0;
      neededBytes = neededBytes || getBytesForCharCode(charCode);
      // Setting the charCode as it to bytes if the byte length is 1
      if (1 == neededBytes) {
        bytes[byteOffset] = charCode;
      } else {
        // Computing the first byte
        bytes[byteOffset++] =
          (parseInt('1111'.slice(0, neededBytes), 2) << (8 - neededBytes)) +
          (charCode >>> (--neededBytes * 6));
        // Computing next bytes
        for (; neededBytes > 0; ) {
          bytes[byteOffset++] = ((charCode >>> (--neededBytes * 6)) & 0x3f) | 0x80;
        }
      }
      return bytes;
    }

    function setBytesFromString(string, bytes, byteOffset, byteLength, strict) {
      string = string || '';
      bytes = bytes || [];
      byteOffset = byteOffset | 0;
      byteLength =
        'number' === typeof byteLength ? byteLength : bytes.byteLength || Infinity;
      for (var i = 0, j = string.length; i < j; i++) {
        var neededBytes = getBytesForCharCode(string[i].codePointAt(0));
        if (strict && byteOffset + neededBytes > byteLength) {
          throw new Error(
            'Not enought bytes to encode the char "' +
              string[i] +
              '" at the offset "' +
              byteOffset +
              '".'
          );
        }
        setBytesFromCharCode(
          string[i].codePointAt(0),
          bytes,
          byteOffset,
          neededBytes);
        byteOffset += neededBytes;
      }
      return bytes;
    }

    // MIDIFile : Read (and soon edit) a MIDI file in a given ArrayBuffer

    // Dependencies





    function ensureArrayBuffer(buf) {
      if (buf) {
        if (buf instanceof ArrayBuffer) {
          return buf;
        }
        if (buf instanceof Uint8Array) {
          // Copy/convert to standard Uint8Array, because derived classes like
          // node.js Buffers might have unexpected data in the .buffer property.
          return new Uint8Array(buf).buffer;
        }
      }
      throw new Error('Unsupported buffer type, need ArrayBuffer or Uint8Array');
    }

    // Constructor
    function MIDIFile(buffer, strictMode) {
      var track;
      var curIndex;
      var i;
      var j;

      // If not buffer given, creating a new MIDI file
      if (!buffer) {
        // Creating the content
        this.header = new MIDIFileHeader_1();
        this.tracks = [new MIDIFileTrack_1()];
        // if a buffer is provided, parsing him
      } else {
        buffer = ensureArrayBuffer(buffer);
        // Minimum MIDI file size is a headerChunk size (14bytes)
        // and an empty track (8+3bytes)
        if (25 > buffer.byteLength) {
          throw new Error(
            'A buffer of a valid MIDI file must have, at least, a' +
              ' size of 25bytes.'
          );
        }
        // Reading header
        this.header = new MIDIFileHeader_1(buffer);
        this.tracks = [];
        curIndex = MIDIFileHeader_1.HEADER_LENGTH;
        // Reading tracks
        for (i = 0, j = this.header.getTracksCount(); i < j; i++) {
          // Testing the buffer length
          if (strictMode && curIndex >= buffer.byteLength - 1) {
            throw new Error(
              "Couldn't find datas corresponding to the track #" + i + '.'
            );
          }
          // Creating the track object
          track = new MIDIFileTrack_1(buffer, curIndex);
          this.tracks.push(track);
          // Updating index to the track end
          curIndex += track.getTrackLength() + 8;
        }
        // Testing integrity : curIndex should be at the end of the buffer
        if (strictMode && curIndex !== buffer.byteLength) {
          throw new Error('It seems that the buffer contains too much datas.');
        }
      }
    }

    // Events reading helpers
    MIDIFile.prototype.getEvents = function(type, subtype) {
      var events;
      var event;
      var playTime = 0;
      var filteredEvents = [];
      var format = this.header.getFormat();
      var tickResolution = this.header.getTickResolution();
      var i;
      var j;
      var trackParsers;
      var smallestDelta;

      // Reading events
      // if the read is sequential
      if (1 !== format || 1 === this.tracks.length) {
        for (i = 0, j = this.tracks.length; i < j; i++) {
          // reset playtime if format is 2
          playTime = 2 === format && playTime ? playTime : 0;
          events = MIDIEvents_1.createParser(
            this.tracks[i].getTrackContent(),
            0,
            false
          );
          // loooping through events
          event = events.next();
          while (event) {
            playTime += event.delta ? event.delta * tickResolution / 1000 : 0;
            if (event.type === MIDIEvents_1.EVENT_META) {
              // tempo change events
              if (event.subtype === MIDIEvents_1.EVENT_META_SET_TEMPO) {
                tickResolution = this.header.getTickResolution(event.tempo);
              }
            }
            // push the asked events
            if (
              (!type || event.type === type) &&
              (!subtype || (event.subtype && event.subtype === subtype))
            ) {
              event.playTime = playTime;
              filteredEvents.push(event);
            }
            event = events.next();
          }
        }
        // the read is concurrent
      } else {
        trackParsers = [];
        smallestDelta = -1;

        // Creating parsers
        for (i = 0, j = this.tracks.length; i < j; i++) {
          trackParsers[i] = {};
          trackParsers[i].parser = MIDIEvents_1.createParser(
            this.tracks[i].getTrackContent(),
            0,
            false
          );
          trackParsers[i].curEvent = trackParsers[i].parser.next();
        }
        // Filling events
        do {
          smallestDelta = -1;
          // finding the smallest event
          for (i = 0, j = trackParsers.length; i < j; i++) {
            if (trackParsers[i].curEvent) {
              if (
                -1 === smallestDelta ||
                trackParsers[i].curEvent.delta <
                  trackParsers[smallestDelta].curEvent.delta
              ) {
                smallestDelta = i;
              }
            }
          }
          if (-1 !== smallestDelta) {
            // removing the delta of previous events
            for (i = 0, j = trackParsers.length; i < j; i++) {
              if (i !== smallestDelta && trackParsers[i].curEvent) {
                trackParsers[i].curEvent.delta -=
                  trackParsers[smallestDelta].curEvent.delta;
              }
            }
            // filling values
            event = trackParsers[smallestDelta].curEvent;
            playTime += event.delta ? event.delta * tickResolution / 1000 : 0;
            if (event.type === MIDIEvents_1.EVENT_META) {
              // tempo change events
              if (event.subtype === MIDIEvents_1.EVENT_META_SET_TEMPO) {
                tickResolution = this.header.getTickResolution(event.tempo);
              }
            }
            // push midi events
            if (
              (!type || event.type === type) &&
              (!subtype || (event.subtype && event.subtype === subtype))
            ) {
              event.playTime = playTime;
              event.track = smallestDelta;
              filteredEvents.push(event);
            }
            // getting next event
            trackParsers[smallestDelta].curEvent = trackParsers[
              smallestDelta
            ].parser.next();
          }
        } while (-1 !== smallestDelta);
      }
      return filteredEvents;
    };

    MIDIFile.prototype.getMidiEvents = function() {
      return this.getEvents(MIDIEvents_1.EVENT_MIDI);
    };

    MIDIFile.prototype.getLyrics = function() {
      var events = this.getEvents(MIDIEvents_1.EVENT_META);
      var texts = [];
      var lyrics = [];
      var event;
      var i;
      var j;

      for (i = 0, j = events.length; i < j; i++) {
        event = events[i];
        // Lyrics
        if (event.subtype === MIDIEvents_1.EVENT_META_LYRICS) {
          lyrics.push(event);
          // Texts
        } else if (event.subtype === MIDIEvents_1.EVENT_META_TEXT) {
          // Ignore special texts
          if ('@' === String.fromCharCode(event.data[0])) {
            if ('T' === String.fromCharCode(event.data[1])) ; else if ('I' === String.fromCharCode(event.data[1])) ; else if ('L' === String.fromCharCode(event.data[1])) ;
            // karaoke text follows, remove all previous text
          } else if (
            0 === String.fromCharCode.apply(String, event.data).indexOf('words')
          ) {
            texts.length = 0;
            // console.log('Word marker found');
            // Karaoke texts
            // If playtime is greater than 0
          } else if (0 !== event.playTime) {
            texts.push(event);
          }
        }
      }
      // Choosing the right lyrics
      if (2 < lyrics.length) {
        texts = lyrics;
      } else if (!texts.length) {
        texts = [];
      }
      // Convert texts and detect encoding
      try {
        texts.forEach(function(event) {
          event.text = UTF8.getStringFromBytes(event.data, 0, event.length, true);
        });
      } catch (e) {
        texts.forEach(function(event) {
          event.text = event.data
            .map(function(c) {
              return String.fromCharCode(c);
            })
            .join('');
        });
      }
      return texts;
    };

    // Basic events reading
    MIDIFile.prototype.getTrackEvents = function(index) {
      var event;
      var events = [];
      var parser;
      if (index > this.tracks.length || 0 > index) {
        throw Error('Invalid track index (' + index + ')');
      }
      parser = MIDIEvents_1.createParser(
        this.tracks[index].getTrackContent(),
        0,
        false
      );
      event = parser.next();
      do {
        events.push(event);
        event = parser.next();
      } while (event);
      return events;
    };

    // Basic events writting
    MIDIFile.prototype.setTrackEvents = function(index, events) {
      var bufferLength;
      var destination;

      if (index > this.tracks.length || 0 > index) {
        throw Error('Invalid track index (' + index + ')');
      }
      if (!events || !events.length) {
        throw Error('A track must contain at least one event, none given.');
      }
      bufferLength = MIDIEvents_1.getRequiredBufferLength(events);
      destination = new Uint8Array(bufferLength);
      MIDIEvents_1.writeToTrack(events, destination);
      this.tracks[index].setTrackContent(destination);
    };

    // Remove a track
    MIDIFile.prototype.deleteTrack = function(index) {
      if (index > this.tracks.length || 0 > index) {
        throw Error('Invalid track index (' + index + ')');
      }
      this.tracks.splice(index, 1);
      this.header.setTracksCount(this.tracks.length);
    };

    // Add a track
    MIDIFile.prototype.addTrack = function(index) {
      var track;

      if (index > this.tracks.length || 0 > index) {
        throw Error('Invalid track index (' + index + ')');
      }
      track = new MIDIFileTrack_1();
      if (index === this.tracks.length) {
        this.tracks.push(track);
      } else {
        this.tracks.splice(index, 0, track);
      }
      this.header.setTracksCount(this.tracks.length);
    };

    // Retrieve the content in a buffer
    MIDIFile.prototype.getContent = function() {
      var bufferLength;
      var destination;
      var origin;
      var i;
      var j;
      var k;
      var l;
      var m;
      var n;

      // Calculating the buffer content
      // - initialize with the header length
      bufferLength = MIDIFileHeader_1.HEADER_LENGTH;
      // - add tracks length
      for (i = 0, j = this.tracks.length; i < j; i++) {
        bufferLength += this.tracks[i].getTrackLength() + 8;
      }
      // Creating the destination buffer
      destination = new Uint8Array(bufferLength);
      // Adding header
      origin = new Uint8Array(
        this.header.datas.buffer,
        this.header.datas.byteOffset,
        MIDIFileHeader_1.HEADER_LENGTH
      );
      for (i = 0, j = MIDIFileHeader_1.HEADER_LENGTH; i < j; i++) {
        destination[i] = origin[i];
      }
      // Adding tracks
      for (k = 0, l = this.tracks.length; k < l; k++) {
        origin = new Uint8Array(
          this.tracks[k].datas.buffer,
          this.tracks[k].datas.byteOffset,
          this.tracks[k].datas.byteLength
        );
        for (m = 0, n = this.tracks[k].datas.byteLength; m < n; m++) {
          destination[i++] = origin[m];
        }
      }
      return destination.buffer;
    };

    // Exports Track/Header constructors
    MIDIFile.Header = MIDIFileHeader_1;
    MIDIFile.Track = MIDIFileTrack_1;

    var MIDIFile_1 = MIDIFile;

    function getMIDIFileFromArrayBuffer(array_buffer) {
        return new MIDIFile_1(array_buffer)
    }

    function getTempo(MIDIObject) {
        if (MIDIObject.header.getTimeDivision() === MIDIFile_1.Header.TICKS_PER_BEAT) {
            return { ticksPerBeat: MIDIObject.header.getTicksPerBeat() }
        } else {
            return { 
                SMPTEFrames:   MIDIObject.header.getSMPTEFrames(),
                ticksPerFrame: MIDIObject.header.getTicksPerFrame() 
            }
        }
    }

    function getEvents(MIDIObject, tracks) {
        let totalEvents = [];

        let events = MIDIObject.getEvents();

        events.forEach((event) => {
            if (event.subtype == MIDIEvents_1.EVENT_META_SET_TEMPO)
                totalEvents.push(event);

            if (event.subtype != MIDIEvents_1.EVENT_MIDI_NOTE_ON) return

            if(!event.track && tracks[0] === true) { // Only one track
                totalEvents.push(event);
                return
            }

            if ((tracks[event.track] === true)) {
                totalEvents.push(event);
            }
        });

        return totalEvents
    }

    const firstPossibleNote  =  21;
    const lastPossibleNote   =  108;

    const capitalNotes = "!@#$%^&*()QWERTYUIOPASDFGHJKLZXCBVNM";

    class Note {
        constructor(value, playTime, tempo, BPM, delta, shifts='keep', oors='keep') {
            this.value      =  value;
            this.playTime   =  playTime;
            this.delta      =  delta;
            this.char       =  vpScale[value - firstPossibleNote];
            this.tempo      =  tempo;
            this.BPM        =  BPM;

            this.valid      = (value >= 21 && value <= 108);
            this.outOfRange = (value <= 35 || value >=  97);

            // Make sure that capital notes go before lowercase ones
            if (capitalNotes.includes(this.char)) {
                if (shifts === 'Start') this.displayValue = value - lastPossibleNote;
                else if (shifts == 'End') this.displayValue = value + lastPossibleNote;
            }
            else if (this.outOfRange) {
                if (oors === 'Start') this.displayValue = value - 1024;
                else if (oors == 'End') this.displayValue = value + 1024;
                else {
                    // Inorder
                    if (lowerOorScale.includes(this.char)) {
                        this.displayValue = value - 1024;
                    }
                    else {
                        this.displayValue = value + 1024;
                    }
                }
            }
            else this.displayValue = value;
        }
    }

    class Chord {
        constructor(notes, classicChordOrder = true, sequentialQuantize = true) {
            let is_quantized = false;
            let previous_note = notes[0];

            for (let note of notes) {
                if (note.playTime != previous_note.playTime) {
                    is_quantized = true;
                    break
                }
                previous_note = note;
            }
            this.is_quantized = is_quantized;

            if (!is_quantized) {
                let values = [];
                let no_dupes = [];

                notes.forEach(note => {
                    if (!(values.includes(note.value))) {
                        values.push(note.value);
                        no_dupes.push(note);
                    }
                });

                this.notes = this.#sortChord(no_dupes, classicChordOrder);
            } else if (is_quantized) {
                if (sequentialQuantize)
                    this.notes = notes;
                else {
                    this.notes = this.#sortChord(notes, classicChordOrder);
                }
            }
        }

        #sortChord(notes, classicChordOrder) {
            return classicChordOrder ? this.#classicChordOrderSort(notes) : notes.sort((a, b) => a.displayValue - b.displayValue);
        }

        // ordering notes in chords based off the first vp converter created
        #classicChordOrderSort(notes) {
            let sortedKeys = [];
            let numericNotes = [];
            let upperNotes = [];
            let lowerNotes = [];

            let startOors = [];
            let endOors = [];

            let lastNonOorNote;

            // sort by midi value instead of display value first
            notes = notes.sort((a, b) => a.value - b.value);

            // split-up notes into categories, also find the last non-oor note
            for (const note of notes) {
                if (note.outOfRange) {
                    if (note.value - 1024 === note.displayValue) {
                        startOors.push(note);
                    }
                    else if (note.value + 1024 === note.displayValue) {
                        endOors.push(note);
                    }
                }
                else {
                    if (!isNaN(note.char)) {
                        numericNotes.push(note);
                    }
                    else if (capitalNotes.includes(note.char)) {
                        upperNotes.push(note);
                    }
                    else {
                        lowerNotes.push(note);
                    }

                    lastNonOorNote = note;
                }
            }

            // determine the order based on the last non-oor note, if any
            if (lastNonOorNote) {
                sortedKeys = capitalNotes.includes(lastNonOorNote.char)
                    ?
                    [...numericNotes, ...lowerNotes, ...upperNotes]
                    :
                    [...upperNotes, ...numericNotes, ...lowerNotes];
            }

            return [...startOors, ...sortedKeys, ...endOors];
        }
    }

    class Sheet {
        constructor(chords) { this.chords = chords; this.missingTempo = false; }

        transpose(by, shifts='Start', oors='Start', classicChordOrder=true, sequentialQuantize=true) { /* Returns a new sheet */
            if (!this.chords) return
            let newChords = [];

            this.chords.forEach((chord) => {
                let newChord = [];

                chord.notes.forEach((note) => {
                    newChord.push(new Note(note.value + by, note.playTime, note.tempo, note.BPM, note.delta, shifts, oors));
                });

                newChords.push(new Chord(newChord, classicChordOrder, sequentialQuantize));
            });
            return new Sheet(newChords)
        }

        countNotes() {
            let notes = 0;
            for (let chord of this.chords) {
                for (let _ of chord.notes)
                    notes++;
            }
            return notes
        }

        /** Returns the approximate text representation of the sheet for debugging purposes */
        text() {
            let result = ''; 

            let chords = this.chords;
            for (let i = 0; i < chords.length; i++) {
                if (!chords) { result += '[no-chords] '; continue }

                const chord = chords[i];

                let isChord = (chord.notes.length > 1 && chord.notes.find(note => note.valid === true));
                if (chord.notes.filter(note => note.outOfRange === false).length <= 1)
                    isChord = false;

                if (isChord) result += '[';

                for (const note of chord.notes) {
                    result += note.char;
                } 

                if (isChord) result += ']';

                result += ' ';
            }
            return result
        }
    }

    function validNoteSpeed(event) {
        return event.tempo && event.tempoBPM && event.tempo !== 0 && event.tempoBPM !== 0
    }

    function generateSheet(events /* Only NOTE_ON & SET_TEMPO events */, settings) /* -> Sheet */ {
        let quantize = settings.quantize;
        let shifts = settings.pShifts;
        let oors = settings.pOors;
        let classicChordOrder = settings.classicChordOrder;
        let sequentialQuantize = settings.sequentialQuantize;
        let bpm = settings.bpm;

        let chords = [];
        let currentChord = [];
        let lastPlaytime = undefined;

        let hasTempo = false;

        let nextBPM = bpm;
        let nextTempo = bpm*4166.66; // Magic number

        // Generate chords
        events.forEach(element => {
            // if event is SET_TEMPO
            if (element.subtype == 0x51 && validNoteSpeed(element)) {
                hasTempo = true;
                nextTempo = element.tempo;
                nextBPM = element.tempoBPM;
                return
            } 
            // event is NOTE_ON
            const key      = element.param1;
            const playtime = element.playTime;
            const delta    = element.delta;

            if (lastPlaytime == undefined)
                lastPlaytime = playtime;

            if (Math.abs(playtime - lastPlaytime) < quantize) {
                currentChord.push(new Note(key, playtime, nextTempo, nextBPM, delta, shifts, oors));
                lastPlaytime = playtime;
            } else {
                if (currentChord.length == 0) {
                    lastPlaytime = playtime;
                    return
                }

                // Submit the chord and start the next one
                chords.push(new Chord(currentChord, classicChordOrder, sequentialQuantize));

                currentChord = [];
                currentChord.push(new Note(key, playtime, nextTempo, nextBPM, delta, shifts, oors));

                lastPlaytime = playtime;
            }
        });

        // Final chord insertion to make sure no notes are left
        chords.push(new Chord(currentChord, classicChordOrder));

        let resultingSheet = new Sheet(chords);

        if (!hasTempo)
            console.log(`No tempo found in sheet, set to ${nextBPM}/${nextTempo}`); 

        resultingSheet.missingTempo = !hasTempo;

        return resultingSheet
    }

    const vpScale =
        `1234567890qwert` +

        `1!2@34$5%6^78*9(0` +
        `qQwWeErtTyYuiIoOpP` +
         `asSdDfgGhHjJklL` +
          `zZxcCvVbBnm` +

        `yuiopasdfghj`;

    const lowercases = '1234567890qwertyuiopasdfghjklzxcvbnm';

    const lowerOorScale = lowercases.slice(0, 15);
    const upperOorScale = lowercases.slice(15, 27);

    /** Returns the transposition of a sheet (line) within [-deviation, +deviation] with the least "effort" to shift */
    function bestTransposition(sheet, deviation, stickTo = 0, strict = false, atLeast = 4, startFrom = 0) {
        if(!sheet?.chords) return stickTo

        function calculateScore(sheet) {
            let monochord = [];
            for (let chord of sheet.chords) {
                for (let note of chord.notes)
                    monochord.push({ char: note.char, oor: note.outOfRange, valid: note.valid });
            }
            // return monochord.filter(note => lowercases.includes(note.char) && note.oor === false && note.valid === true).length
            let all = monochord.filter(note => note.oor === false && note.valid === true);
            let lowercaseCount = all.filter(note => lowercases.includes(note.char));
            let uppercaseCount = all.filter(note => !(lowercases.includes(note.char)));
            return Math.abs(uppercaseCount.length-lowercaseCount.length)
        }

        let stickScore = calculateScore(sheet.transpose(stickTo));

        let most = stickScore;
        let best = stickTo;

        function consider(deviation) {
            let contender = sheet.transpose(deviation);
            let score = calculateScore(contender);
            // console.log('atleast:', atLeast)
            // console.log([`stickTo: ${stickTo}`,
            //              `Most: ${most}`,
            //              `Original: ${sheet.text()}`,
            //              `Stuck: ${sheet.transpose(stickTo).text()}`,
            //              `Transposed by ${deviation}: ${sheet.transpose(deviation).text()}`,
            //              `Score: ${score}`,
            //              `StartFrom: ${startFrom}`,
            //              `Gained: ${score - most}`].join('\n'))
            if (score > most) {
                if (!strict) {
                    let difference = score - most;
                    if (difference <= atLeast) { // Minimal lowercase gain, not worth it, don't consider
                        return
                    }
                }
                // console.log(`Good to go with ${most}, transposed by ${deviation}, sheet: ${sheet.text()}`)
                most = score;
                best = deviation;
            }
        }

        for (let i = 0; i <= deviation; i++) {
            consider(stickTo - i);
            consider(stickTo + i);
        }
        return best
    }

    function separator(beat, difference) {
        if (difference < beat / 4)
            return '-'
        if (difference < beat / 2)
            return ' '
        if (difference < beat) // Or equal to a beat
            return ' - '
        if (difference < beat * 2)
            return ', '
        if (difference < beat * 3)
            return '... '
        if (difference < beat * 4)
            return '.... '
        else return '...... '
    }

    /* src\components\SheetOptions.svelte generated by Svelte v3.55.1 */
    const file$3 = "src\\components\\SheetOptions.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (29:0) {#if show}
    function create_if_block$2(ctx) {
    	let div0;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let button0;
    	let t4;
    	let div1;
    	let button1;
    	let t6;
    	let label1;
    	let t8;
    	let input1;
    	let t9;
    	let span0;
    	let t10_value = /*settings*/ ctx[0].lbauto_atleast + "";
    	let t10;
    	let t11;
    	let div7;
    	let div2;
    	let label2;
    	let t13;
    	let select0;
    	let option0;
    	let option1;
    	let select0_disabled_value;
    	let t16;
    	let div3;
    	let label3;
    	let t18;
    	let select1;
    	let option2;
    	let option3;
    	let option4;
    	let t22;
    	let div4;
    	let label4;
    	let t24;
    	let select2;
    	let t25;
    	let div5;
    	let label5;
    	let t27;
    	let input2;
    	let t28;
    	let span1;
    	let t29;

    	let t30_value = (/*settings*/ ctx[0].beats == 1
    	? "1 beat"
    	: `${/*settings*/ ctx[0].beats} beats`) + "";

    	let t30;
    	let t31;
    	let t32;
    	let div6;
    	let label6;
    	let t34;
    	let input3;
    	let t35;
    	let span2;
    	let t36_value = /*settings*/ ctx[0].quantize + "";
    	let t36;
    	let t37;
    	let t38;
    	let label7;
    	let input4;
    	let t39;
    	let t40;
    	let label8;
    	let input5;
    	let t41;
    	let t42;
    	let label9;
    	let input6;
    	let t43;
    	let t44;
    	let label10;
    	let input7;
    	let t45;
    	let t46;
    	let t47;
    	let button2;
    	let t49;
    	let button3;
    	let t51;
    	let button4;
    	let button4_disabled_value;
    	let t52;
    	let t53;
    	let style;
    	let mounted;
    	let dispose;
    	let each_value = /*fonts*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block0 = /*settings*/ ctx[0].missingTempo == true && create_if_block_5(ctx);
    	let if_block1 = /*settings*/ ctx[0].oors && /*settings*/ ctx[0].tempoMarks && create_if_block_4(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*settings*/ ctx[0].capturingImage) return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);
    	let if_block3 = typeof ClipboardItem !== "undefined" && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Transpose (sheet) by:";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			button0 = element("button");
    			button0.textContent = "Auto-transpose";
    			t4 = space();
    			div1 = element("div");
    			button1 = element("button");
    			button1.textContent = "Line-based auto-transpose";
    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "Resilience (?):";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			span0 = element("span");
    			t10 = text(t10_value);
    			t11 = space();
    			div7 = element("div");
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Place shifted notes at:";
    			t13 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Start";
    			option1 = element("option");
    			option1.textContent = "End";
    			t16 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Place out of range notes at:";
    			t18 = space();
    			select1 = element("select");
    			option2 = element("option");
    			option2.textContent = "Inorder";
    			option3 = element("option");
    			option3.textContent = "Start";
    			option4 = element("option");
    			option4.textContent = "End";
    			t22 = space();
    			div4 = element("div");
    			label4 = element("label");
    			label4.textContent = "Font:";
    			t24 = space();
    			select2 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t25 = space();
    			div5 = element("div");
    			label5 = element("label");
    			label5.textContent = "Break lines:";
    			t27 = space();
    			input2 = element("input");
    			t28 = space();
    			span1 = element("span");
    			t29 = text("Every ");
    			t30 = text(t30_value);
    			t31 = space();
    			if (if_block0) if_block0.c();
    			t32 = space();
    			div6 = element("div");
    			label6 = element("label");
    			label6.textContent = "Quantize:";
    			t34 = space();
    			input3 = element("input");
    			t35 = space();
    			span2 = element("span");
    			t36 = text(t36_value);
    			t37 = text(" miliseconds");
    			t38 = space();
    			label7 = element("label");
    			input4 = element("input");
    			t39 = text("\n        Classic chord order");
    			t40 = space();
    			label8 = element("label");
    			input5 = element("input");
    			t41 = text("\n        Sequential quantizes");
    			t42 = space();
    			label9 = element("label");
    			input6 = element("input");
    			t43 = text("\n        Include out of range (ctrl) notes");
    			t44 = space();
    			label10 = element("label");
    			input7 = element("input");
    			t45 = text("\n        Show tempo marks");
    			t46 = space();
    			if (if_block1) if_block1.c();
    			t47 = space();
    			button2 = element("button");
    			button2.textContent = "Copy Text";
    			t49 = space();
    			button3 = element("button");
    			button3.textContent = "Copy Transposes";
    			t51 = space();
    			button4 = element("button");
    			if_block2.c();
    			t52 = space();
    			if (if_block3) if_block3.c();
    			t53 = space();
    			style = element("style");
    			style.textContent = "label {\n        max-width: fit-content;\n        text-align: center;\n    }\n\n    .select-div {\n        display: flex;\n        flex-direction: row;\n        align-items: center;\n        text-align: center;\n    }\n\n    select {\n        height: auto;\n        margin-left: 0.4em;\n        margin-top: 0.2em;\n        margin-bottom: 0;\n    }\n\n    input[type=\"checkbox\"] {\n        display: inline-block;\n        vertical-align: middle;\n    }\n\n    input[type=\"range\"] {\n        margin-left: 0.4em;\n        margin-right: 0.4em;\n        margin-bottom: 0;\n    }\n\n    input[type=\"file\"] {\n        margin-bottom: 0;\n    }\n\n    input[type=\"text\"] {\n        margin-bottom: 0;\n    }\n    \n    .beats, .quantize, .select-label, .tempo {\n        display: flex;\n        flex-direction: row;\n    }";
    			attr_dev(label0, "for", "transpose");
    			add_location(label0, file$3, 30, 1, 731);
    			attr_dev(input0, "id", "transpose");
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "-24");
    			attr_dev(input0, "max", "24");
    			add_location(input0, file$3, 31, 1, 785);
    			add_location(button0, file$3, 32, 4, 877);
    			set_style(div0, "display", "inline-block");
    			add_location(div0, file$3, 29, 0, 694);
    			set_style(button1, "margin-bottom", "0");
    			add_location(button1, file$3, 36, 4, 982);
    			set_style(label1, "margin-left", "0.5em");
    			set_style(label1, "display", "flex");
    			set_style(label1, "align-items", "center");
    			attr_dev(label1, "title", "Controls how much better a transposition should be than the previous transposition for line-based auto-transpose to act (higher = less transposing)");
    			attr_dev(label1, "for", "atleast");
    			attr_dev(label1, "class", "slider-label");
    			add_location(label1, file$3, 37, 4, 1101);
    			attr_dev(input1, "id", "atleast");
    			attr_dev(input1, "type", "range");
    			attr_dev(input1, "min", "1");
    			attr_dev(input1, "max", "24");
    			add_location(input1, file$3, 40, 4, 1412);
    			set_style(span0, "display", "flex");
    			set_style(span0, "align-items", "center");
    			add_location(span0, file$3, 41, 4, 1500);
    			attr_dev(div1, "class", "quantize");
    			add_location(div1, file$3, 35, 0, 955);
    			attr_dev(label2, "for", "shifts-position");
    			add_location(label2, file$3, 46, 8, 1632);
    			option0.__value = "Start";
    			option0.value = option0.__value;
    			add_location(option0, file$3, 48, 12, 1834);
    			option1.__value = "End";
    			option1.value = option1.__value;
    			add_location(option1, file$3, 49, 12, 1883);
    			select0.disabled = select0_disabled_value = /*settings*/ ctx[0].classicChordOrder;
    			attr_dev(select0, "name", "shifts-position");
    			attr_dev(select0, "id", "shifts-position");
    			if (/*settings*/ ctx[0].pShifts === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[8].call(select0));
    			add_location(select0, file$3, 47, 8, 1701);
    			attr_dev(div2, "class", "select-div");
    			add_location(div2, file$3, 45, 4, 1599);
    			attr_dev(label3, "for", "oors-position");
    			add_location(label3, file$3, 54, 8, 1983);
    			option2.__value = "Inorder";
    			option2.value = option2.__value;
    			add_location(option2, file$3, 56, 12, 2144);
    			option3.__value = "Start";
    			option3.value = option3.__value;
    			add_location(option3, file$3, 57, 12, 2197);
    			option4.__value = "End";
    			option4.value = option4.__value;
    			add_location(option4, file$3, 58, 12, 2246);
    			attr_dev(select1, "name", "oors-position");
    			attr_dev(select1, "id", "oors-position");
    			if (/*settings*/ ctx[0].pOors === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[9].call(select1));
    			add_location(select1, file$3, 55, 8, 2055);
    			attr_dev(div3, "class", "select-div");
    			add_location(div3, file$3, 53, 4, 1950);
    			attr_dev(label4, "for", "font");
    			add_location(label4, file$3, 63, 8, 2346);
    			attr_dev(select2, "name", "font");
    			attr_dev(select2, "id", "font");
    			if (/*settings*/ ctx[0].font === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[10].call(select2));
    			add_location(select2, file$3, 64, 8, 2386);
    			attr_dev(div4, "class", "select-div");
    			add_location(div4, file$3, 62, 4, 2313);
    			attr_dev(label5, "class", "slider-label");
    			attr_dev(label5, "for", "beats-for-newline");
    			add_location(label5, file$3, 72, 8, 2613);
    			attr_dev(input2, "type", "range");
    			attr_dev(input2, "id", "beats-for-newline");
    			attr_dev(input2, "min", "1");
    			attr_dev(input2, "max", "32");
    			add_location(input2, file$3, 73, 8, 2695);
    			add_location(span1, file$3, 74, 8, 2788);
    			attr_dev(div5, "class", "beats");
    			add_location(div5, file$3, 71, 4, 2585);
    			attr_dev(label6, "class", "slider-label");
    			attr_dev(label6, "for", "quantize-prompt");
    			add_location(label6, file$3, 88, 8, 3322);
    			attr_dev(input3, "type", "range");
    			attr_dev(input3, "id", "quantize-prompt");
    			attr_dev(input3, "min", "1");
    			attr_dev(input3, "max", "100");
    			add_location(input3, file$3, 89, 8, 3399);
    			add_location(span2, file$3, 90, 8, 3494);
    			attr_dev(div6, "class", "quantize");
    			add_location(div6, file$3, 87, 4, 3291);
    			attr_dev(input4, "type", "checkbox");
    			attr_dev(input4, "id", "classic-chord-order");
    			add_location(input4, file$3, 94, 8, 3597);
    			attr_dev(label7, "for", "classic-chord-order");
    			add_location(label7, file$3, 93, 4, 3555);
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "id", "order-quantizes");
    			add_location(input5, file$3, 99, 8, 3772);
    			attr_dev(label8, "for", "order-quantizes");
    			add_location(label8, file$3, 98, 4, 3734);
    			attr_dev(input6, "type", "checkbox");
    			attr_dev(input6, "id", "out-of-range");
    			add_location(input6, file$3, 104, 8, 3942);
    			attr_dev(label9, "for", "out-of-range");
    			add_location(label9, file$3, 103, 4, 3907);
    			attr_dev(input7, "type", "checkbox");
    			attr_dev(input7, "id", "tempo-checkbox");
    			add_location(input7, file$3, 109, 8, 4110);
    			attr_dev(label10, "for", "tempo-checkbox");
    			add_location(label10, file$3, 108, 4, 4073);
    			add_location(button2, file$3, 120, 4, 4448);
    			add_location(button3, file$3, 124, 4, 4534);
    			button4.disabled = button4_disabled_value = /*settings*/ ctx[0].capturingImage;
    			add_location(button4, file$3, 128, 4, 4632);
    			add_location(div7, file$3, 44, 0, 1589);
    			add_location(style, file$3, 154, 0, 5322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			set_input_value(input0, /*settings*/ ctx[0].transposition);
    			append_dev(div0, t2);
    			append_dev(div0, button0);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button1);
    			append_dev(div1, t6);
    			append_dev(div1, label1);
    			append_dev(div1, t8);
    			append_dev(div1, input1);
    			set_input_value(input1, /*settings*/ ctx[0].lbauto_atleast);
    			append_dev(div1, t9);
    			append_dev(div1, span0);
    			append_dev(span0, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t13);
    			append_dev(div2, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			select_option(select0, /*settings*/ ctx[0].pShifts);
    			append_dev(div7, t16);
    			append_dev(div7, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t18);
    			append_dev(div3, select1);
    			append_dev(select1, option2);
    			append_dev(select1, option3);
    			append_dev(select1, option4);
    			select_option(select1, /*settings*/ ctx[0].pOors);
    			append_dev(div7, t22);
    			append_dev(div7, div4);
    			append_dev(div4, label4);
    			append_dev(div4, t24);
    			append_dev(div4, select2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select2, null);
    			}

    			select_option(select2, /*settings*/ ctx[0].font);
    			append_dev(div7, t25);
    			append_dev(div7, div5);
    			append_dev(div5, label5);
    			append_dev(div5, t27);
    			append_dev(div5, input2);
    			set_input_value(input2, /*settings*/ ctx[0].beats);
    			append_dev(div5, t28);
    			append_dev(div5, span1);
    			append_dev(span1, t29);
    			append_dev(span1, t30);
    			append_dev(div7, t31);
    			if (if_block0) if_block0.m(div7, null);
    			append_dev(div7, t32);
    			append_dev(div7, div6);
    			append_dev(div6, label6);
    			append_dev(div6, t34);
    			append_dev(div6, input3);
    			set_input_value(input3, /*settings*/ ctx[0].quantize);
    			append_dev(div6, t35);
    			append_dev(div6, span2);
    			append_dev(span2, t36);
    			append_dev(span2, t37);
    			append_dev(div7, t38);
    			append_dev(div7, label7);
    			append_dev(label7, input4);
    			input4.checked = /*settings*/ ctx[0].classicChordOrder;
    			append_dev(label7, t39);
    			append_dev(div7, t40);
    			append_dev(div7, label8);
    			append_dev(label8, input5);
    			input5.checked = /*settings*/ ctx[0].sequentialQuantize;
    			append_dev(label8, t41);
    			append_dev(div7, t42);
    			append_dev(div7, label9);
    			append_dev(label9, input6);
    			input6.checked = /*settings*/ ctx[0].oors;
    			append_dev(label9, t43);
    			append_dev(div7, t44);
    			append_dev(div7, label10);
    			append_dev(label10, input7);
    			input7.checked = /*settings*/ ctx[0].tempoMarks;
    			append_dev(label10, t45);
    			append_dev(div7, t46);
    			if (if_block1) if_block1.m(div7, null);
    			append_dev(div7, t47);
    			append_dev(div7, button2);
    			append_dev(div7, t49);
    			append_dev(div7, button3);
    			append_dev(div7, t51);
    			append_dev(div7, button4);
    			if_block2.m(button4, null);
    			append_dev(div7, t52);
    			if (if_block3) if_block3.m(div7, null);
    			insert_dev(target, t53, anchor);
    			insert_dev(target, style, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(button0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[6], false, false, false),
    					listen_dev(input1, "change", /*input1_change_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_change_input_handler*/ ctx[7]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[8]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[9]),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[10]),
    					listen_dev(input2, "change", /*input2_change_input_handler*/ ctx[11]),
    					listen_dev(input2, "input", /*input2_change_input_handler*/ ctx[11]),
    					listen_dev(input3, "change", /*input3_change_input_handler*/ ctx[13]),
    					listen_dev(input3, "input", /*input3_change_input_handler*/ ctx[13]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[14]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[15]),
    					listen_dev(input6, "change", /*input6_change_handler*/ ctx[16]),
    					listen_dev(input7, "change", /*input7_change_handler*/ ctx[17]),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[19], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[20], false, false, false),
    					listen_dev(button4, "click", /*click_handler_4*/ ctx[21], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*settings*/ 1 && to_number(input0.value) !== /*settings*/ ctx[0].transposition) {
    				set_input_value(input0, /*settings*/ ctx[0].transposition);
    			}

    			if (dirty & /*settings*/ 1) {
    				set_input_value(input1, /*settings*/ ctx[0].lbauto_atleast);
    			}

    			if (dirty & /*settings*/ 1 && t10_value !== (t10_value = /*settings*/ ctx[0].lbauto_atleast + "")) set_data_dev(t10, t10_value);

    			if (dirty & /*settings*/ 1 && select0_disabled_value !== (select0_disabled_value = /*settings*/ ctx[0].classicChordOrder)) {
    				prop_dev(select0, "disabled", select0_disabled_value);
    			}

    			if (dirty & /*settings*/ 1) {
    				select_option(select0, /*settings*/ ctx[0].pShifts);
    			}

    			if (dirty & /*settings*/ 1) {
    				select_option(select1, /*settings*/ ctx[0].pOors);
    			}

    			if (dirty & /*fonts*/ 8) {
    				each_value = /*fonts*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*settings*/ 1) {
    				select_option(select2, /*settings*/ ctx[0].font);
    			}

    			if (dirty & /*settings*/ 1) {
    				set_input_value(input2, /*settings*/ ctx[0].beats);
    			}

    			if (dirty & /*settings*/ 1 && t30_value !== (t30_value = (/*settings*/ ctx[0].beats == 1
    			? "1 beat"
    			: `${/*settings*/ ctx[0].beats} beats`) + "")) set_data_dev(t30, t30_value);

    			if (/*settings*/ ctx[0].missingTempo == true) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div7, t32);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*settings*/ 1) {
    				set_input_value(input3, /*settings*/ ctx[0].quantize);
    			}

    			if (dirty & /*settings*/ 1 && t36_value !== (t36_value = /*settings*/ ctx[0].quantize + "")) set_data_dev(t36, t36_value);

    			if (dirty & /*settings*/ 1) {
    				input4.checked = /*settings*/ ctx[0].classicChordOrder;
    			}

    			if (dirty & /*settings*/ 1) {
    				input5.checked = /*settings*/ ctx[0].sequentialQuantize;
    			}

    			if (dirty & /*settings*/ 1) {
    				input6.checked = /*settings*/ ctx[0].oors;
    			}

    			if (dirty & /*settings*/ 1) {
    				input7.checked = /*settings*/ ctx[0].tempoMarks;
    			}

    			if (/*settings*/ ctx[0].oors && /*settings*/ ctx[0].tempoMarks) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(div7, t47);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(button4, null);
    				}
    			}

    			if (dirty & /*settings*/ 1 && button4_disabled_value !== (button4_disabled_value = /*settings*/ ctx[0].capturingImage)) {
    				prop_dev(button4, "disabled", button4_disabled_value);
    			}

    			if (typeof ClipboardItem !== "undefined") if_block3.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			if (if_block3) if_block3.d();
    			if (detaching) detach_dev(t53);
    			if (detaching) detach_dev(style);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(29:0) {#if show}",
    		ctx
    	});

    	return block;
    }

    // (66:12) {#each fonts as font}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*font*/ ctx[23] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*font*/ ctx[23];
    			option.value = option.__value;
    			add_location(option, file$3, 66, 16, 2494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(66:12) {#each fonts as font}",
    		ctx
    	});

    	return block;
    }

    // (78:4) {#if settings.missingTempo == true}
    function create_if_block_5(ctx) {
    	let div;
    	let label;
    	let t1;
    	let input;
    	let t2;
    	let span;
    	let t3_value = /*settings*/ ctx[0].bpm + "";
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			label.textContent = "BPM (?):";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			attr_dev(label, "class", "slider-label");
    			attr_dev(label, "for", "tempo");
    			attr_dev(label, "title", "You're able to change this because your MIDI file doesn't have tempo/BPM.");
    			add_location(label, file$3, 79, 12, 2960);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "id", "tempo");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "max", "300");
    			add_location(input, file$3, 82, 12, 3149);
    			add_location(span, file$3, 83, 12, 3233);
    			attr_dev(div, "class", "tempo");
    			add_location(div, file$3, 78, 8, 2928);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*settings*/ ctx[0].bpm);
    			append_dev(div, t2);
    			append_dev(div, span);
    			append_dev(span, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[12]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*settings*/ 1) {
    				set_input_value(input, /*settings*/ ctx[0].bpm);
    			}

    			if (dirty & /*settings*/ 1 && t3_value !== (t3_value = /*settings*/ ctx[0].bpm + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(78:4) {#if settings.missingTempo == true}",
    		ctx
    	});

    	return block;
    }

    // (114:4) {#if settings.oors && settings.tempoMarks}
    function create_if_block_4(ctx) {
    	let div;
    	let label;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			label.textContent = "Out-of-range prefix:";
    			t1 = space();
    			input = element("input");
    			attr_dev(label, "for", "oor-prefix");
    			add_location(label, file$3, 115, 8, 4293);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "oor-prefix");
    			add_location(input, file$3, 116, 8, 4354);
    			add_location(div, file$3, 114, 4, 4279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*settings*/ ctx[0].oorPrefix);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[18]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*settings*/ 1 && input.value !== /*settings*/ ctx[0].oorPrefix) {
    				set_input_value(input, /*settings*/ ctx[0].oorPrefix);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(114:4) {#if settings.oors && settings.tempoMarks}",
    		ctx
    	});

    	return block;
    }

    // (135:8) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Download Image");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(135:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (133:8) {#if settings.capturingImage}
    function create_if_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Please Wait...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(133:8) {#if settings.capturingImage}",
    		ctx
    	});

    	return block;
    }

    // (140:4) {#if typeof ClipboardItem !== "undefined"}
    function create_if_block_1$1(ctx) {
    	let button;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*settings*/ ctx[0].capturingImage) return create_if_block_2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if_block.c();
    			button.disabled = button_disabled_value = /*settings*/ ctx[0].capturingImage;
    			add_location(button, file$3, 141, 8, 5006);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if_block.m(button, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_5*/ ctx[22], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}

    			if (dirty & /*settings*/ 1 && button_disabled_value !== (button_disabled_value = /*settings*/ ctx[0].capturingImage)) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(140:4) {#if typeof ClipboardItem !== \\\"undefined\\\"}",
    		ctx
    	});

    	return block;
    }

    // (148:12) {:else}
    function create_else_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Copy Image");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(148:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (146:12) {#if settings.capturingImage}
    function create_if_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Please Wait...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(146:12) {#if settings.capturingImage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*show*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*show*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SheetOptions', slots, []);
    	let dispatch = createEventDispatcher();
    	let { show } = $$props;

    	let fonts = [
    		'Verdana',
    		'Tahoma',
    		'Dejavu Sans',
    		'Segoe UI',
    		'Gill Sans',
    		'Helvetica',
    		'Lucida Sans',
    		'Century Gothic'
    	];

    	let { settings = {
    		beats: 4,
    		quantize: 35,
    		classicChordOrder: true,
    		sequentialQuantize: false,
    		pShifts: 'Start',
    		pOors: 'Inorder',
    		oors: true,
    		tempoMarks: false,
    		oorPrefix: '\\',
    		transposition: 0,
    		lbauto_atleast: 4,
    		font: fonts[0],
    		capturingImage: false,
    		missingTempo: false,
    		bpm: 120
    	} } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (show === undefined && !('show' in $$props || $$self.$$.bound[$$self.$$.props['show']])) {
    			console.warn("<SheetOptions> was created without expected prop 'show'");
    		}
    	});

    	const writable_props = ['show', 'settings'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SheetOptions> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		settings.transposition = to_number(this.value);
    		$$invalidate(0, settings);
    	}

    	const click_handler = () => {
    		dispatch('auto');
    	};

    	const click_handler_1 = () => {
    		dispatch('lineBasedAuto');
    	};

    	function input1_change_input_handler() {
    		settings.lbauto_atleast = to_number(this.value);
    		$$invalidate(0, settings);
    	}

    	function select0_change_handler() {
    		settings.pShifts = select_value(this);
    		$$invalidate(0, settings);
    	}

    	function select1_change_handler() {
    		settings.pOors = select_value(this);
    		$$invalidate(0, settings);
    	}

    	function select2_change_handler() {
    		settings.font = select_value(this);
    		$$invalidate(0, settings);
    	}

    	function input2_change_input_handler() {
    		settings.beats = to_number(this.value);
    		$$invalidate(0, settings);
    	}

    	function input_change_input_handler() {
    		settings.bpm = to_number(this.value);
    		$$invalidate(0, settings);
    	}

    	function input3_change_input_handler() {
    		settings.quantize = to_number(this.value);
    		$$invalidate(0, settings);
    	}

    	function input4_change_handler() {
    		settings.classicChordOrder = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input5_change_handler() {
    		settings.sequentialQuantize = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input6_change_handler() {
    		settings.oors = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input7_change_handler() {
    		settings.tempoMarks = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input_input_handler() {
    		settings.oorPrefix = this.value;
    		$$invalidate(0, settings);
    	}

    	const click_handler_2 = () => dispatch("copyText");
    	const click_handler_3 = () => dispatch("copyTransposes");
    	const click_handler_4 = () => dispatch("captureSheetAsImage", { mode: "download" });
    	const click_handler_5 = () => dispatch("captureSheetAsImage", { mode: "copy" });

    	$$self.$$set = $$props => {
    		if ('show' in $$props) $$invalidate(1, show = $$props.show);
    		if ('settings' in $$props) $$invalidate(0, settings = $$props.settings);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		show,
    		fonts,
    		settings
    	});

    	$$self.$inject_state = $$props => {
    		if ('dispatch' in $$props) $$invalidate(2, dispatch = $$props.dispatch);
    		if ('show' in $$props) $$invalidate(1, show = $$props.show);
    		if ('fonts' in $$props) $$invalidate(3, fonts = $$props.fonts);
    		if ('settings' in $$props) $$invalidate(0, settings = $$props.settings);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		settings,
    		show,
    		dispatch,
    		fonts,
    		input0_input_handler,
    		click_handler,
    		click_handler_1,
    		input1_change_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		select2_change_handler,
    		input2_change_input_handler,
    		input_change_input_handler,
    		input3_change_input_handler,
    		input4_change_handler,
    		input5_change_handler,
    		input6_change_handler,
    		input7_change_handler,
    		input_input_handler,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class SheetOptions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { show: 1, settings: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetOptions",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get show() {
    		throw new Error("<SheetOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<SheetOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get settings() {
    		throw new Error("<SheetOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings(value) {
    		throw new Error("<SheetOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Track.svelte generated by Svelte v3.55.1 */

    const file$2 = "src\\components\\Track.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let input;
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = /*track*/ ctx[1].getTrackLength() + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = text("\n    Track ");
    			t1 = text(/*idx*/ ctx[2]);
    			t2 = text(" - ");
    			t3 = text(t3_value);
    			t4 = text(" events");
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$2, 6, 4, 101);
    			attr_dev(div, "id", "track");
    			add_location(div, file$2, 5, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			input.checked = /*selected*/ ctx[0];
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selected*/ 1) {
    				input.checked = /*selected*/ ctx[0];
    			}

    			if (dirty & /*idx*/ 4) set_data_dev(t1, /*idx*/ ctx[2]);
    			if (dirty & /*track*/ 2 && t3_value !== (t3_value = /*track*/ ctx[1].getTrackLength() + "")) set_data_dev(t3, t3_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Track', slots, []);
    	let { track, idx } = $$props;
    	let { selected = false } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (track === undefined && !('track' in $$props || $$self.$$.bound[$$self.$$.props['track']])) {
    			console.warn("<Track> was created without expected prop 'track'");
    		}

    		if (idx === undefined && !('idx' in $$props || $$self.$$.bound[$$self.$$.props['idx']])) {
    			console.warn("<Track> was created without expected prop 'idx'");
    		}
    	});

    	const writable_props = ['track', 'idx', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Track> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		selected = this.checked;
    		$$invalidate(0, selected);
    	}

    	$$self.$$set = $$props => {
    		if ('track' in $$props) $$invalidate(1, track = $$props.track);
    		if ('idx' in $$props) $$invalidate(2, idx = $$props.idx);
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({ track, idx, selected });

    	$$self.$inject_state = $$props => {
    		if ('track' in $$props) $$invalidate(1, track = $$props.track);
    		if ('idx' in $$props) $$invalidate(2, idx = $$props.idx);
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, track, idx, input_change_handler];
    }

    class Track extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { track: 1, idx: 2, selected: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Track",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get track() {
    		throw new Error("<Track>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set track(value) {
    		throw new Error("<Track>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get idx() {
    		throw new Error("<Track>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set idx(value) {
    		throw new Error("<Track>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Track>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Track>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const colors = {
        long: 'white',
        quadruple: '#a3f0a3',
        whole: '#74da74',
        half: '#9ada5a',
        quarter: '#c0c05a',
        eighth: '#da7e5a',
        sixteenth: '#daa6a6',
        thirtysecond: '#ff1900',
        sixtyfourth: '#9c0f00'
    };

    function colored_string(s, color) {
        return `<span style="color:${color}">${s}</span>`
    }

    /* src\components\Line.svelte generated by Svelte v3.55.1 */
    const file$1 = "src\\components\\Line.svelte";

    // (189:8) {:else}
    function create_else_block(ctx) {
    	let html_tag;
    	let raw_value = /*render*/ ctx[6](/*sheet*/ ctx[4]) + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sheet*/ 16 && raw_value !== (raw_value = /*render*/ ctx[6](/*sheet*/ ctx[4]) + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(189:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (183:8) {#if (comment || comment == '')}
    function create_if_block$1(ctx) {
    	let span;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*comment*/ ctx[0]);
    			attr_dev(span, "autofocus", "");
    			attr_dev(span, "contenteditable", "true");
    			attr_dev(span, "class", "comment svelte-jszitz");
    			if (/*comment*/ ctx[0] === void 0) add_render_callback(() => /*span_input_handler*/ ctx[13].call(span));
    			add_location(span, file$1, 184, 12, 7365);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (/*comment*/ ctx[0] !== void 0) {
    				span.textContent = /*comment*/ ctx[0];
    			}

    			span.focus();

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "focusout", /*updateComment*/ ctx[7], false, false, false),
    					listen_dev(span, "input", /*span_input_handler*/ ctx[13])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*comment*/ 1) set_data_dev(t, /*comment*/ ctx[0]);

    			if (dirty & /*comment*/ 1 && /*comment*/ ctx[0] !== span.textContent) {
    				span.textContent = /*comment*/ ctx[0];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(183:8) {#if (comment || comment == '')}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*comment*/ ctx[0] || /*comment*/ ctx[0] == '') return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			attr_dev(div0, "class", "line svelte-jszitz");
    			add_location(div0, file$1, 163, 4, 6351);
    			attr_dev(div1, "class", "viewer svelte-jszitz");
    			set_style(div1, "font-family", /*settings*/ ctx[2].font);
    			add_location(div1, file$1, 162, 0, 6259);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_block.m(div0, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "mousedown", /*mousedown_handler*/ ctx[14], false, false, false),
    					listen_dev(div0, "contextmenu", prevent_default(/*contextmenu_handler_1*/ ctx[12]), false, true, false),
    					listen_dev(div1, "contextmenu", prevent_default(/*contextmenu_handler*/ ctx[11]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if (dirty & /*settings*/ 4) {
    				set_style(div1, "font-family", /*settings*/ ctx[2].font);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Line', slots, []);
    	let dispatch = createEventDispatcher();
    	let { index } = $$props; /* ID */
    	let { comment = undefined } = $$props;
    	let { line } = $$props; /* Sheet-like */
    	let { passedNext } = $$props; // Next note for coloring purposes
    	let originalSheet = new Sheet(line.chords);
    	let sheet = originalSheet;
    	let { sameTranspositionAsPrevious = false } = $$props;
    	let { settings } = $$props;
    	let penalty = 0.000;
    	let previousChord = { notes: [{ playTime: -999999 }] };

    	function colored_chord(chord, color, separator = ' ') {
    		let isChord = chord.notes.length > 1 && chord.notes.find(note => note.valid === true);
    		let res = `<span style="color:${color}; ${isChord ? "display: inline-flex;" : ""}">`;
    		let oorSpanStyle = `display:inline-block;`;
    		if (settings.oors === false) if (chord.notes.filter(note => note.outOfRange === false).length <= 1) isChord = false;
    		const oorSeparator = ":";
    		let nonOors = chord.notes.filter(note => note.outOfRange === false);
    		let startOors = chord.notes.filter(note => note.outOfRange === true && note.displayValue === note.value - 1024);
    		let endOors = chord.notes.filter(note => note.outOfRange === true && note.displayValue === note.value + 1024);
    		if (isChord) res += '[';

    		for (const note of chord.notes) {
    			if (!note.valid) {
    				res += '_';
    				continue;
    			}

    			if (note.outOfRange === true) {
    				if (settings.oors === true) {
    					const isFirstStartOor = note === startOors[0];
    					const isFirstEndOorWithoutChord = !isChord && note === endOors[0];
    					const isChordWithNoNonOorsAndIsFirstEndOor = isChord && nonOors.length === 0 && startOors.length === 0 && note === endOors[0];
    					const isChordWithMoreThanOneNonOorAndIsFirstEndOor = isChord && nonOors.length > 0 && note === endOors[0];

    					if (isFirstStartOor || isFirstEndOorWithoutChord || isChordWithNoNonOorsAndIsFirstEndOor || isChordWithMoreThanOneNonOorAndIsFirstEndOor) {
    						res += oorSeparator;
    					}

    					res += `<span style="${oorSpanStyle}">${settings.tempoMarks ? settings.oorPrefix : ''}${note.char}${isFirstStartOor && nonOors.length > 0 ? "'" : ""}</span>`;
    				}
    			} else {
    				res += note.char;
    			}
    		}

    		if (isChord) res += ']';
    		return res + '</span>';
    	}

    	function render(sheet) {
    		const negtransposition = -line.transposition;
    		let result = '';

    		if (!sameTranspositionAsPrevious) {
    			let text = `Transpose by: ${negtransposition > 0 ? '+' : ''}${negtransposition}`;
    			if (line.difference) text += ` (${-line.difference > 0 ? '+' : ''}${-line.difference})`;
    			result += colored_string(text + '\n', 'white');
    		}

    		let chords = sheet.chords;

    		for (let i = 0; i < chords.length; i++) {
    			if (!chords) {
    				result += '[bad-midi-file!]<br>';
    				continue;
    			}

    			const current = { chord: chords[i] };
    			current.note = current.chord?.notes[0];
    			const next = { chord: chords[i + 1] };
    			next.note = next.chord?.notes[0];

    			if (!current.note) {
    				continue;
    			}

    			if (!next.note) {
    				if (passedNext) {
    					next.note = passedNext;
    				} else {
    					result += colored_chord(current.chord, 'white');
    					continue;
    				}
    			}

    			let beat = current.note.tempo / 1000;
    			let difference = next.note.playTime - current.note.playTime;
    			if (current.chord.is_quantized) difference = next.note.playTime - current.chord.notes.slice(-1)[0].playTime;
    			difference -= 0.5;
    			let color = colors.long;
    			if (difference < beat / 16) color = colors.sixtyfourth; else if (difference < beat / 8) color = colors.thirtysecond; else if (difference < beat / 4) color = colors.sixteenth; else if (difference < beat / 2) color = colors.eighth; else if (difference < beat) color = colors.quarter; else if (difference < beat * 2) color = colors.half; else if (difference < beat * 4) color = colors.whole; else if (difference < beat * 8) color = colors.quadruple; else if (difference < beat * 16) color = colors.long; // Or equal to a beat
    			result += colored_chord(current.chord, color);

    			if (settings.tempoMarks) {
    				// what a mess
    				if (!settings.oors) if (current.chord.notes.some(note => note.outOfRange == false)) result += colored_string(separator(beat, difference), color); else result += ' '; else result += colored_string(separator(beat, difference), color);
    			} else result += ' ';
    		}

    		return result;
    	}

    	function updateComment() {
    		if (comment == '' || comment == '<br>') dispatch('comment', { action: 'remove', index: +index }); else dispatch('comment', { index: +index, action: 'update', comment });
    	}

    	$$self.$$.on_mount.push(function () {
    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<Line> was created without expected prop 'index'");
    		}

    		if (line === undefined && !('line' in $$props || $$self.$$.bound[$$self.$$.props['line']])) {
    			console.warn("<Line> was created without expected prop 'line'");
    		}

    		if (passedNext === undefined && !('passedNext' in $$props || $$self.$$.bound[$$self.$$.props['passedNext']])) {
    			console.warn("<Line> was created without expected prop 'passedNext'");
    		}

    		if (settings === undefined && !('settings' in $$props || $$self.$$.bound[$$self.$$.props['settings']])) {
    			console.warn("<Line> was created without expected prop 'settings'");
    		}
    	});

    	const writable_props = [
    		'index',
    		'comment',
    		'line',
    		'passedNext',
    		'sameTranspositionAsPrevious',
    		'settings'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Line> was created with unknown prop '${key}'`);
    	});

    	function contextmenu_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function contextmenu_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function span_input_handler() {
    		comment = this.textContent;
    		$$invalidate(0, comment);
    	}

    	const mousedown_handler = e => {
    		switch (e.button) {
    			case 0:
    				// Left
    				if (comment) return;
    				if (e.ctrlKey) dispatch('comment', { action: 'add', index: +index }); else dispatch('transpose', { index: +index, by: 1 });
    				break;
    			case 1:
    				// Middle
    				dispatch('auto', {
    					index: +index,
    					sheet: originalSheet,
    					keepGoing: e.ctrlKey
    				});
    				e.preventDefault();
    				break;
    			case 2:
    				// Right
    				if (e.ctrlKey && comment) dispatch('comment', { action: 'remove', index: +index }); else dispatch('transpose', { index: +index, by: -1 });
    				break;
    		}
    	};

    	$$self.$$set = $$props => {
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('comment' in $$props) $$invalidate(0, comment = $$props.comment);
    		if ('line' in $$props) $$invalidate(8, line = $$props.line);
    		if ('passedNext' in $$props) $$invalidate(9, passedNext = $$props.passedNext);
    		if ('sameTranspositionAsPrevious' in $$props) $$invalidate(10, sameTranspositionAsPrevious = $$props.sameTranspositionAsPrevious);
    		if ('settings' in $$props) $$invalidate(2, settings = $$props.settings);
    	};

    	$$self.$capture_state = () => ({
    		colors,
    		colored_string,
    		separator,
    		lowerOorScale,
    		upperOorScale,
    		Sheet,
    		createEventDispatcher,
    		dispatch,
    		index,
    		comment,
    		line,
    		passedNext,
    		originalSheet,
    		sheet,
    		sameTranspositionAsPrevious,
    		settings,
    		penalty,
    		previousChord,
    		colored_chord,
    		render,
    		updateComment
    	});

    	$$self.$inject_state = $$props => {
    		if ('dispatch' in $$props) $$invalidate(5, dispatch = $$props.dispatch);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('comment' in $$props) $$invalidate(0, comment = $$props.comment);
    		if ('line' in $$props) $$invalidate(8, line = $$props.line);
    		if ('passedNext' in $$props) $$invalidate(9, passedNext = $$props.passedNext);
    		if ('originalSheet' in $$props) $$invalidate(3, originalSheet = $$props.originalSheet);
    		if ('sheet' in $$props) $$invalidate(4, sheet = $$props.sheet);
    		if ('sameTranspositionAsPrevious' in $$props) $$invalidate(10, sameTranspositionAsPrevious = $$props.sameTranspositionAsPrevious);
    		if ('settings' in $$props) $$invalidate(2, settings = $$props.settings);
    		if ('penalty' in $$props) penalty = $$props.penalty;
    		if ('previousChord' in $$props) previousChord = $$props.previousChord;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*line, originalSheet, settings*/ 268) {
    			{
    				previousChord = { notes: [{ playTime: -999999 }] };
    				$$invalidate(8, line.originalSheet = $$invalidate(3, originalSheet = new Sheet(line.chords)), line);
    				$$invalidate(4, sheet = originalSheet.transpose(line.transposition, settings.pShifts, settings.pOors, settings.classicChordOrder, settings.sequentialQuantize));
    				penalty = 0.000;
    			}
    		}
    	};

    	return [
    		comment,
    		index,
    		settings,
    		originalSheet,
    		sheet,
    		dispatch,
    		render,
    		updateComment,
    		line,
    		passedNext,
    		sameTranspositionAsPrevious,
    		contextmenu_handler,
    		contextmenu_handler_1,
    		span_input_handler,
    		mousedown_handler
    	];
    }

    class Line extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			index: 1,
    			comment: 0,
    			line: 8,
    			passedNext: 9,
    			sameTranspositionAsPrevious: 10,
    			settings: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Line",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get index() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get comment() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set comment(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get line() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set line(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get passedNext() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set passedNext(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sameTranspositionAsPrevious() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sameTranspositionAsPrevious(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get settings() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.55.1 */

    const { Object: Object_1, console: console_1, document: document_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i][0];
    	child_ctx[38] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	child_ctx[42] = list;
    	child_ctx[43] = i;
    	return child_ctx;
    }

    // (335:0) {#if trackSelection}
    function create_if_block_1(ctx) {
    	let section;
    	let div;
    	let t0;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*tracks*/ ctx[5];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			button = element("button");
    			button.textContent = "Import selected tracks";
    			attr_dev(div, "id", "tracks");
    			add_location(div, file, 336, 4, 10302);
    			add_location(button, file, 342, 4, 10479);
    			attr_dev(section, "id", "track-chooser");
    			add_location(section, file, 335, 0, 10269);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(section, t0);
    			append_dev(section, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[25], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tracks, selectedTracks*/ 96) {
    				each_value_1 = /*tracks*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(335:0) {#if trackSelection}",
    		ctx
    	});

    	return block;
    }

    // (338:8) {#each tracks as track, idx}
    function create_each_block_1(ctx) {
    	let track;
    	let updating_selected;
    	let current;

    	function track_selected_binding(value) {
    		/*track_selected_binding*/ ctx[24](value, /*idx*/ ctx[43]);
    	}

    	let track_props = {
    		track: /*track*/ ctx[41],
    		idx: /*idx*/ ctx[43] + 1
    	};

    	if (/*selectedTracks*/ ctx[6][/*idx*/ ctx[43]] !== void 0) {
    		track_props.selected = /*selectedTracks*/ ctx[6][/*idx*/ ctx[43]];
    	}

    	track = new Track({ props: track_props, $$inline: true });
    	binding_callbacks.push(() => bind(track, 'selected', track_selected_binding));

    	const block = {
    		c: function create() {
    			create_component(track.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(track, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const track_changes = {};
    			if (dirty[0] & /*tracks*/ 32) track_changes.track = /*track*/ ctx[41];

    			if (!updating_selected && dirty[0] & /*selectedTracks*/ 64) {
    				updating_selected = true;
    				track_changes.selected = /*selectedTracks*/ ctx[6][/*idx*/ ctx[43]];
    				add_flush_callback(() => updating_selected = false);
    			}

    			track.$set(track_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(track.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(track.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(track, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(338:8) {#each tracks as track, idx}",
    		ctx
    	});

    	return block;
    }

    // (347:0) {#if sheetReady}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let div0_resize_listener;
    	let current;
    	let each_value = Object.entries(/*lines*/ ctx[1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(div0, "width", "max-content");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[26].call(div0));
    			add_location(div0, file, 348, 8, 10670);
    			set_style(div1, "background", "#2D2A32");
    			add_location(div1, file, 347, 4, 10606);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[26].bind(div0));
    			/*div1_binding*/ ctx[27](div1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*lines, settings, stap, lineTransposed, autoLine, comment*/ 417795) {
    				each_value = Object.entries(/*lines*/ ctx[1]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			div0_resize_listener();
    			/*div1_binding*/ ctx[27](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(347:0) {#if sheetReady}",
    		ctx
    	});

    	return block;
    }

    // (350:12) {#each Object.entries(lines) as [ index, line ]}
    function create_each_block(ctx) {
    	let line;
    	let current;

    	line = new Line({
    			props: {
    				line: /*line*/ ctx[38],
    				index: /*index*/ ctx[37],
    				settings: /*settings*/ ctx[0],
    				comment: /*line*/ ctx[38].comment,
    				passedNext: /*line*/ ctx[38].continuation,
    				sameTranspositionAsPrevious: /*stap*/ ctx[18](/*index*/ ctx[37])
    			},
    			$$inline: true
    		});

    	line.$on("transpose", /*lineTransposed*/ ctx[13]);
    	line.$on("auto", /*autoLine*/ ctx[14]);
    	line.$on("comment", /*comment*/ ctx[17]);

    	const block = {
    		c: function create() {
    			create_component(line.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(line, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const line_changes = {};
    			if (dirty[0] & /*lines*/ 2) line_changes.line = /*line*/ ctx[38];
    			if (dirty[0] & /*lines*/ 2) line_changes.index = /*index*/ ctx[37];
    			if (dirty[0] & /*settings*/ 1) line_changes.settings = /*settings*/ ctx[0];
    			if (dirty[0] & /*lines*/ 2) line_changes.comment = /*line*/ ctx[38].comment;
    			if (dirty[0] & /*lines*/ 2) line_changes.passedNext = /*line*/ ctx[38].continuation;
    			if (dirty[0] & /*lines*/ 2) line_changes.sameTranspositionAsPrevious = /*stap*/ ctx[18](/*index*/ ctx[37]);
    			line.$set(line_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(line.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(line.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(line, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(350:12) {#each Object.entries(lines) as [ index, line ]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t0;
    	let div;
    	let label;
    	let t1;
    	let a;
    	let t3;
    	let input;
    	let t4;
    	let sheetoptions;
    	let updating_settings;
    	let t5;
    	let t6;
    	let if_block1_anchor;
    	let current;

    	function sheetoptions_settings_binding(value) {
    		/*sheetoptions_settings_binding*/ ctx[21](value);
    	}

    	let sheetoptions_props = { show: /*sheetReady*/ ctx[4] };

    	if (/*settings*/ ctx[0] !== void 0) {
    		sheetoptions_props.settings = /*settings*/ ctx[0];
    	}

    	sheetoptions = new SheetOptions({
    			props: sheetoptions_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(sheetoptions, 'settings', sheetoptions_settings_binding));
    	sheetoptions.$on("auto", /*auto*/ ctx[11]);
    	sheetoptions.$on("lineBasedAuto", /*lineBasedAuto_handler*/ ctx[22]);
    	sheetoptions.$on("captureSheetAsImage", /*handleCaptureSheetAsImage*/ ctx[16]);
    	sheetoptions.$on("copyText", /*copyText_handler*/ ctx[23]);
    	sheetoptions.$on("copyTransposes", /*copyTransposes*/ ctx[15]);
    	let if_block0 = /*trackSelection*/ ctx[3] && create_if_block_1(ctx);
    	let if_block1 = /*sheetReady*/ ctx[4] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			div = element("div");
    			label = element("label");
    			t1 = text("Please import a MIDI file:\n        ");
    			a = element("a");
    			a.textContent = "How do I use this?";
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			create_component(sheetoptions.$$.fragment);
    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			document_1.title = "MIDI Converter";
    			attr_dev(a, "href", "https://github.com/ArijanJ/midi-converter/wiki/Usage");
    			add_location(a, file, 302, 8, 9234);
    			attr_dev(label, "for", "file");
    			add_location(label, file, 300, 4, 9172);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", ".mid,.midi");
    			add_location(input, file, 304, 4, 9337);
    			set_style(div, "display", "inline-block");
    			add_location(div, file, 299, 0, 9132);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t1);
    			append_dev(label, a);
    			append_dev(div, t3);
    			append_dev(div, input);
    			/*input_binding*/ ctx[20](input);
    			insert_dev(target, t4, anchor);
    			mount_component(sheetoptions, target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sheetoptions_changes = {};
    			if (dirty[0] & /*sheetReady*/ 16) sheetoptions_changes.show = /*sheetReady*/ ctx[4];

    			if (!updating_settings && dirty[0] & /*settings*/ 1) {
    				updating_settings = true;
    				sheetoptions_changes.settings = /*settings*/ ctx[0];
    				add_flush_callback(() => updating_settings = false);
    			}

    			sheetoptions.$set(sheetoptions_changes);

    			if (/*trackSelection*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*trackSelection*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t6.parentNode, t6);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*sheetReady*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*sheetReady*/ 16) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sheetoptions.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sheetoptions.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			/*input_binding*/ ctx[20](null);
    			if (detaching) detach_dev(t4);
    			destroy_component(sheetoptions, detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function copyCapturedImage(blob) {
    	// note: ClipboardItem is not supported by mozilla
    	try {
    		navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    	} catch(err) {
    		console.error(err);
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let fileInput;
    	let trackSelection = false;
    	let sheetReady = false;
    	let MIDIObject;
    	let tracks;

    	// VP.js/Sheet
    	let originalSheet;

    	// [true, true, false, true, ...]
    	let selectedTracks;

    	// For line break calculations
    	let penalty = 0.000;

    	let error_range = 0.5;
    	let container;
    	let notesContainerWidth;

    	onMount(() => {
    		fileInput.addEventListener(
    			'change',
    			async () => {
    				await fileInput.files[0].arrayBuffer().then(arrbuf => {
    					MIDIObject = getMIDIFileFromArrayBuffer(arrbuf);
    					if (!getTempo(MIDIObject).ticksPerBeat) console.error("No ticksPerBeat in this midi file");
    					$$invalidate(5, tracks = MIDIObject.tracks);
    					$$invalidate(6, selectedTracks = tracks.map(() => true));
    					$$invalidate(3, trackSelection = true);
    					$$invalidate(4, sheetReady = false);
    					penalty = 0.000;
    				});
    			},
    			false
    		);
    	});

    	function shouldBreak(note) {
    		if (!note) return false;
    		let tempo_ms = note.tempo / 1000; // Turn 652174 into 652.174
    		let goal = tempo_ms * settings.beats;
    		let normalizedPlayTime = note.playTime - penalty;

    		if (normalizedPlayTime + error_range >= goal) {
    			penalty += normalizedPlayTime;
    			return true;
    		}
    	}

    	let saveSheet = () => {
    		let events = getEvents(MIDIObject, selectedTracks);
    		originalSheet = generateSheet(events, settings);
    		$$invalidate(0, settings.missingTempo = originalSheet.missingTempo, settings);
    	};

    	let createLines = () => {
    		$$invalidate(4, sheetReady = false);
    		if (!originalSheet) return;
    		const chords = originalSheet.chords;
    		penalty = 0.000;
    		$$invalidate(1, lines = []);
    		let acc = []; // Chord[]

    		for (let i = 0; i <= chords.length; i++) {
    			const current = { chord: chords[i] };
    			current.note = current.chord?.notes[0];
    			const next = { chord: chords[i + 1] };
    			next.note = next.chord?.notes[0];
    			if (!current.note || !current.chord) continue;

    			if (shouldBreak(current.note) && acc.length > 0) {
    				lines.push({
    					chords: acc,
    					transposition: settings.transposition,
    					continuation: current.note
    				});

    				acc = [];
    			}

    			acc.push(current.chord);
    		}

    		lines.push({
    			chords: acc,
    			transposition: 0,
    			continuation: undefined
    		}); /* Push the leftovers */

    		$$invalidate(4, sheetReady = true);

    		// Hide TrackChooser
    		$$invalidate(3, trackSelection = false);

    		(((($$invalidate(1, lines), $$invalidate(19, oldSettings)), $$invalidate(0, settings)), $$invalidate(10, createLines)), $$invalidate(9, saveSheet));
    	};

    	let oldSettings;
    	let settings;

    	let auto = () => {
    		$$invalidate(0, settings.transposition = bestTransposition(originalSheet, 11), settings);
    		for (let i = 0; i < lines.length; i++) setLineTransposition(i, settings.transposition);
    	};

    	let lineBasedAuto = (fromLine = 0) => {
    		let previous = bestTransposition(lines[fromLine].originalSheet, 11, 0, true);

    		for (let index = fromLine; index <= lines.length; index++) {
    			const line = lines[index];
    			if (!line) continue;
    			const newTransposition = bestTransposition(line.originalSheet, 8, previous, false, settings.lbauto_atleast, previous);
    			setLineTransposition(index, newTransposition);
    			previous = newTransposition;
    		}

    		(((($$invalidate(1, lines), $$invalidate(19, oldSettings)), $$invalidate(0, settings)), $$invalidate(10, createLines)), $$invalidate(9, saveSheet));
    	};

    	let lines = []; // [{ chords: Chord[], transposition?, continuation: undefined, comment: false }, ...]

    	function setLineTransposition(idx, transposition) {
    		let index = +idx;
    		$$invalidate(1, lines[index].transposition = transposition, lines);
    		if (lines[index - 1]) $$invalidate(1, lines[index].difference = lines[index].transposition - lines[index - 1].transposition, lines);
    		if (lines[index + 1]) $$invalidate(1, lines[index + 1].difference = lines[index + 1].transposition - lines[index].transposition, lines);
    	}

    	let lineTransposed = e => {
    		const index = e.detail.index;
    		const by = e.detail.by;

    		setTimeout(
    			() => {
    				setLineTransposition(index, lines[index].transposition + by);
    			},
    			0
    		);
    	};

    	let autoLine = e => {
    		const keepGoing = e.detail.keepGoing;
    		const index = e.detail.index;
    		const sheet = e.detail.sheet;
    		let previous = lines[index - 1]?.transposition ?? 0;
    		setLineTransposition(index, bestTransposition(sheet, 11, previous, 0, 0));

    		if (keepGoing) {
    			// Transpose all the way down
    			lineBasedAuto(index);
    		}
    	};

    	let getTransposesOfSheet = () => {
    		let transposes = lines.reduce(
    			(acc, line, i) => {
    				if (i === 0 || (lines[i - 1]?.transposition ?? 0) !== line.transposition) {
    					acc.push(-line.transposition);
    				}

    				return acc;
    			},
    			[]
    		);

    		return transposes;
    	};

    	let copyTransposes = () => {
    		let transposes = getTransposesOfSheet();
    		navigator.clipboard.writeText(transposes.join(" "));
    	};

    	/**
     * Takes an image of the sheet, which can then be either copied/downloaded.
     * The image should be cropped to the maximum measure length via the value notesContainerWidth.
     * It's value depends on the max-content width of the div where notesContainerWidth is set.
     * @param {string} mode - A string indicating how the user wants to retrieve the image.
     * @enum {string} ["download", "copy"]
     */
    	function captureSheetAsImage(mode) {
    		$$invalidate(0, settings.capturingImage = true, settings);

    		setTimeout(
    			() => Gt(container, { width: notesContainerWidth, scale: 2 }).then(blob => {
    				if (mode === "copy") {
    					copyCapturedImage(blob);
    				} else {
    					downloadCapturedImage(blob);
    				}

    				$$invalidate(0, settings.capturingImage = false, settings);
    			}),
    			250
    		);
    	}

    	function handleCaptureSheetAsImage(event) {
    		captureSheetAsImage(event.detail.mode);
    	}

    	function downloadCapturedImage(blob) {
    		const url = URL.createObjectURL(blob);

    		// create a temporary element to download the image
    		let filename = fileInput.files[0].name.split(".");

    		filename.pop();
    		filename = filename.join(".") + ".png";
    		let linkEl = document.createElement("a");
    		linkEl.href = url;
    		linkEl.download = filename;
    		document.body.appendChild(linkEl);
    		linkEl.click();
    		URL.revokeObjectURL(url);
    		document.body.removeChild(linkEl);
    	}

    	function comment(e) {
    		const index = e.detail.index;
    		const action = e.detail.action;
    		const comment = e.detail.comment;

    		switch (action) {
    			case "add":
    				{
    					setTimeout(
    						() => {
    							// Make sure previous comment, if it exists, gets to update
    							if (lines[index - 1]?.comment) return;

    							lines.splice(index, 0, { comment: "Add a comment..." });
    							(((($$invalidate(1, lines), $$invalidate(19, oldSettings)), $$invalidate(0, settings)), $$invalidate(10, createLines)), $$invalidate(9, saveSheet));
    						},
    						0
    					);

    					break;
    				}
    			case "remove":
    				{
    					lines.splice(index, 1);
    					(((($$invalidate(1, lines), $$invalidate(19, oldSettings)), $$invalidate(0, settings)), $$invalidate(10, createLines)), $$invalidate(9, saveSheet));
    					break;
    				}
    			case "update":
    				{
    					$$invalidate(1, lines[index].comment = comment, lines);
    				}
    		}
    	}

    	/** Checks if a line at index has same transposition as previous non-comment line */
    	function stap(index) {
    		const line = lines[index];

    		for (let i = index - 1; i >= 0; i--) {
    			const previous = lines[i];
    			if (previous.comment) continue;
    			return previous.transposition == line.transposition;
    		}
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			fileInput = $$value;
    			$$invalidate(2, fileInput);
    		});
    	}

    	function sheetoptions_settings_binding(value) {
    		settings = value;
    		$$invalidate(0, settings);
    	}

    	const lineBasedAuto_handler = () => {
    		lineBasedAuto();
    	};

    	const copyText_handler = () => {
    		$$invalidate(0, settings.tempoMarks = true, settings);

    		setTimeout(
    			() => {
    				let text = '';
    				let linesElement = container.querySelector('div.viewer').parentElement;

    				for (let line of linesElement.children) {
    					if (!line?.innerText) continue;
    					let lineNotes = line.children[0].innerText.split("\n");

    					if (lineNotes[0].includes("Transpose")) {
    						lineNotes[0] += "\n";
    					}

    					text += lineNotes.join("") + '\n';
    				}

    				navigator.clipboard.writeText(text);
    			},
    			0
    		);
    	};

    	function track_selected_binding(value, idx) {
    		if ($$self.$$.not_equal(selectedTracks[idx], value)) {
    			selectedTracks[idx] = value;
    			$$invalidate(6, selectedTracks);
    		}
    	}

    	const click_handler = () => {
    		saveSheet();
    		createLines();
    	};

    	function div0_elementresize_handler() {
    		notesContainerWidth = this.clientWidth;
    		$$invalidate(8, notesContainerWidth);
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(7, container);
    		});
    	}

    	$$self.$capture_state = () => ({
    		domToBlob: Gt,
    		getMIDIFileFromArrayBuffer,
    		getEvents,
    		getTempo,
    		generateSheet,
    		bestTransposition,
    		SheetOptions,
    		Track,
    		Line,
    		onMount,
    		fileInput,
    		trackSelection,
    		sheetReady,
    		MIDIObject,
    		tracks,
    		originalSheet,
    		selectedTracks,
    		penalty,
    		error_range,
    		container,
    		notesContainerWidth,
    		shouldBreak,
    		saveSheet,
    		createLines,
    		oldSettings,
    		settings,
    		auto,
    		lineBasedAuto,
    		lines,
    		setLineTransposition,
    		lineTransposed,
    		autoLine,
    		getTransposesOfSheet,
    		copyTransposes,
    		captureSheetAsImage,
    		handleCaptureSheetAsImage,
    		copyCapturedImage,
    		downloadCapturedImage,
    		comment,
    		stap
    	});

    	$$self.$inject_state = $$props => {
    		if ('fileInput' in $$props) $$invalidate(2, fileInput = $$props.fileInput);
    		if ('trackSelection' in $$props) $$invalidate(3, trackSelection = $$props.trackSelection);
    		if ('sheetReady' in $$props) $$invalidate(4, sheetReady = $$props.sheetReady);
    		if ('MIDIObject' in $$props) MIDIObject = $$props.MIDIObject;
    		if ('tracks' in $$props) $$invalidate(5, tracks = $$props.tracks);
    		if ('originalSheet' in $$props) originalSheet = $$props.originalSheet;
    		if ('selectedTracks' in $$props) $$invalidate(6, selectedTracks = $$props.selectedTracks);
    		if ('penalty' in $$props) penalty = $$props.penalty;
    		if ('error_range' in $$props) error_range = $$props.error_range;
    		if ('container' in $$props) $$invalidate(7, container = $$props.container);
    		if ('notesContainerWidth' in $$props) $$invalidate(8, notesContainerWidth = $$props.notesContainerWidth);
    		if ('saveSheet' in $$props) $$invalidate(9, saveSheet = $$props.saveSheet);
    		if ('createLines' in $$props) $$invalidate(10, createLines = $$props.createLines);
    		if ('oldSettings' in $$props) $$invalidate(19, oldSettings = $$props.oldSettings);
    		if ('settings' in $$props) $$invalidate(0, settings = $$props.settings);
    		if ('auto' in $$props) $$invalidate(11, auto = $$props.auto);
    		if ('lineBasedAuto' in $$props) $$invalidate(12, lineBasedAuto = $$props.lineBasedAuto);
    		if ('lines' in $$props) $$invalidate(1, lines = $$props.lines);
    		if ('lineTransposed' in $$props) $$invalidate(13, lineTransposed = $$props.lineTransposed);
    		if ('autoLine' in $$props) $$invalidate(14, autoLine = $$props.autoLine);
    		if ('getTransposesOfSheet' in $$props) getTransposesOfSheet = $$props.getTransposesOfSheet;
    		if ('copyTransposes' in $$props) $$invalidate(15, copyTransposes = $$props.copyTransposes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*oldSettings, settings, lines*/ 524291) {
    			$: {
    				if (!oldSettings) {
    					$$invalidate(19, oldSettings = { ...settings });
    					break $;
    				}

    				if (oldSettings.transposition != settings.transposition) {
    					for (let line of lines) {
    						line.transposition = settings.transposition;
    					}

    					(((($$invalidate(1, lines), $$invalidate(19, oldSettings)), $$invalidate(0, settings)), $$invalidate(10, createLines)), $$invalidate(9, saveSheet));
    				} else if (oldSettings.beats != settings.beats) {
    					createLines();
    				} else if (oldSettings.quantize != settings.quantize || oldSettings.sequentialQuantize != settings.sequentialQuantize || oldSettings.classicChordOrder != settings.classicChordOrder) {
    					saveSheet();
    					createLines();
    					(((($$invalidate(1, lines), $$invalidate(19, oldSettings)), $$invalidate(0, settings)), $$invalidate(10, createLines)), $$invalidate(9, saveSheet));
    				} else if (oldSettings.bpm != settings.bpm) {
    					saveSheet();
    					createLines();
    				}

    				$$invalidate(19, oldSettings = { ...settings });
    			}
    		}
    	};

    	return [
    		settings,
    		lines,
    		fileInput,
    		trackSelection,
    		sheetReady,
    		tracks,
    		selectedTracks,
    		container,
    		notesContainerWidth,
    		saveSheet,
    		createLines,
    		auto,
    		lineBasedAuto,
    		lineTransposed,
    		autoLine,
    		copyTransposes,
    		handleCaptureSheetAsImage,
    		comment,
    		stap,
    		oldSettings,
    		input_binding,
    		sheetoptions_settings_binding,
    		lineBasedAuto_handler,
    		copyText_handler,
    		track_selected_binding,
    		click_handler,
    		div0_elementresize_handler,
    		div1_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
