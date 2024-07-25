
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
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
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

    var Pe = Object.defineProperty, _e = Object.defineProperties;
    var Ue = Object.getOwnPropertyDescriptors;
    var L = Object.getOwnPropertySymbols;
    var Z = Object.prototype.hasOwnProperty, ee = Object.prototype.propertyIsEnumerable;
    var te = Math.pow, Q = (e, t, r) => t in e ? Pe(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, T = (e, t) => {
      for (var r in t || (t = {}))
        Z.call(t, r) && Q(e, r, t[r]);
      if (L)
        for (var r of L(t))
          ee.call(t, r) && Q(e, r, t[r]);
      return e;
    }, R = (e, t) => _e(e, Ue(t));
    var re = (e, t) => {
      var r = {};
      for (var n in e)
        Z.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
      if (e != null && L)
        for (var n of L(e))
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
    const fe = "p".charCodeAt(0), de = "H".charCodeAt(0), me = "Y".charCodeAt(0), ge = "s".charCodeAt(0);
    let q;
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
      q || (q = $e());
      for (let r = 0; r < e.length; r++)
        t = q[(t ^ e[r]) & 255] ^ t >>> 8;
      return t ^ -1;
    }
    function Le(e) {
      const t = e.length - 1;
      for (let r = t; r >= 4; r--)
        if (e[r - 4] === 9 && e[r - 3] === fe && e[r - 2] === de && e[r - 1] === me && e[r] === ge)
          return r - 3;
      return 0;
    }
    function he(e, t, r = !1) {
      const n = new Uint8Array(13);
      t *= 39.3701, n[0] = fe, n[1] = de, n[2] = me, n[3] = ge, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
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
    const H = "[modern-screenshot]", x = typeof window != "undefined", qe = x && "Worker" in window, we = x && "atob" in window;
    var le;
    const z = x ? (le = window.navigator) == null ? void 0 : le.userAgent : "", pe = z.includes("Chrome"), M = z.includes("AppleWebKit") && !pe, X = z.includes("Firefox"), He = (e) => e && "__CONTEXT__" in e, ze = (e) => e.constructor.name === "CSSFontFaceRule", Xe = (e) => e.constructor.name === "CSSImportRule", A = (e) => e.nodeType === 1, U = (e) => typeof e.className == "object", ye = (e) => e.tagName === "image", Ge = (e) => e.tagName === "use", F = (e) => A(e) && typeof e.style != "undefined" && !U(e), Ye = (e) => e.nodeType === 8, Je = (e) => e.nodeType === 3, D = (e) => e.tagName === "IMG", O = (e) => e.tagName === "VIDEO", Ke = (e) => e.tagName === "CANVAS", ne = (e) => e.tagName === "TEXTAREA", Qe = (e) => e.tagName === "INPUT", Ze = (e) => e.tagName === "STYLE", et = (e) => e.tagName === "SCRIPT", tt = (e) => e.tagName === "SELECT", rt = (e) => e.tagName === "SLOT", nt = (e) => e.tagName === "IFRAME", C = (...e) => console.warn(H, ...e), ot = (e) => console.time(`${H} ${e}`), at = (e) => console.timeEnd(`${H} ${e}`), st = (e) => {
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
      const r = W().implementation.createHTMLDocument(), n = r.createElement("base"), a = r.createElement("a");
      return r.head.appendChild(n), r.body.appendChild(a), t && (n.href = t), a.href = e, a.href;
    }
    function W(e) {
      var t;
      return (t = e && A(e) ? e == null ? void 0 : e.ownerDocument : e) != null ? t : window.document;
    }
    const j = "http://www.w3.org/2000/svg";
    function Se(e, t, r) {
      const n = W(r).createElementNS(j, "svg");
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
            return C("Failed canvas to blob", { type: t, quality: r }, n), ct(e.toDataURL(t, r));
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
      const r = W(t).createElement("img");
      return r.decoding = "sync", r.loading = "eager", r.src = e, r;
    }
    function P(e, t) {
      return new Promise((r) => {
        const { timeout: n, ownerDocument: a, onError: s } = t != null ? t : {}, o = typeof e == "string" ? k(e, W(a)) : e;
        let i = null, l = null;
        function u() {
          r(o), i && clearTimeout(i), l == null || l();
        }
        if (n && (i = setTimeout(u, n)), O(o)) {
          const c = o.currentSrc || o.src;
          if (!c)
            return o.poster ? P(o.poster, t).then(r) : u();
          if (o.readyState >= 2)
            return u();
          const f = u, d = (m) => {
            C(
              "Failed video load",
              c,
              m
            ), s == null || s(m), u();
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
              } catch (m) {
                C(
                  "Failed to decode image, trying to render anyway",
                  o.dataset.originalSrc || c,
                  m
                );
              }
            u();
          }), d = (m) => {
            C(
              "Failed image load",
              o.dataset.originalSrc || c,
              m
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
        F(e) && (D(e) || O(e) ? yield P(e, { timeout: t }) : yield Promise.all(
          ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => P(n, { timeout: t })))
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
        warn: (...t) => e && C(...t)
      };
    }
    function mt(e) {
      return {
        cache: e ? "no-cache" : "force-cache"
      };
    }
    function N(e, t) {
      return S(this, null, function* () {
        return He(e) ? e : gt(e, R(T({}, t), { autoDestruct: !0 }));
      });
    }
    function gt(e, t) {
      return S(this, null, function* () {
        var m, h, w, y, g;
        const { scale: r = 1, workerUrl: n, workerNumber: a = 1 } = t || {}, s = Boolean(t == null ? void 0 : t.debug), o = (m = t == null ? void 0 : t.features) != null ? m : !0, i = (h = e.ownerDocument) != null ? h : x ? window.document : void 0, l = (y = (w = e.ownerDocument) == null ? void 0 : w.defaultView) != null ? y : x ? window : void 0, u = /* @__PURE__ */ new Map(), c = R(T({
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
            requestInit: mt((g = t == null ? void 0 : t.fetch) == null ? void 0 : g.bypassingCache),
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
          svgDefsElement: i == null ? void 0 : i.createElementNS(j, "defs"),
          svgStyles: /* @__PURE__ */ new Map(),
          defaultComputedStyles: /* @__PURE__ */ new Map(),
          workers: [
            ...new Array(
              qe && n && a ? a : 0
            )
          ].map(() => {
            try {
              const b = new Worker(n);
              return b.onmessage = (p) => S(this, null, function* () {
                var I, J, B, K;
                const { url: E, result: v } = p.data;
                v ? (J = (I = u.get(E)) == null ? void 0 : I.resolve) == null || J.call(I, v) : (K = (B = u.get(E)) == null ? void 0 : B.reject) == null || K.call(B, new Error(`Error receiving message from worker: ${E}`));
              }), b.onmessageerror = (p) => {
                var v, I;
                const { url: E } = p.data;
                (I = (v = u.get(E)) == null ? void 0 : v.reject) == null || I.call(v, new Error(`Error receiving message from worker: ${E}`));
              }, b;
            } catch (b) {
              return C("Failed to new Worker", b), null;
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
            var p, E;
            return b === "restoreScrollPosition" ? typeof o == "boolean" ? !1 : (p = o[b]) != null ? p : !1 : typeof o == "boolean" ? o : (E = o[b]) != null ? E : !0;
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
        const o = yield P(e, { timeout: n }), { canvas: i, context2d: l } = pt(e.ownerDocument, t), u = () => {
          try {
            l == null || l.drawImage(o, 0, 0, i.width, i.height);
          } catch (c) {
            C("Failed to drawImage", c);
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
      const { defaultComputedStyles: n, ownerDocument: a } = r, s = e.nodeName.toLowerCase(), o = U(e) && s !== "svg", i = o ? bt.map((g) => [g, e.getAttribute(g)]).filter(([, g]) => g !== null) : [], l = [
        o && "svg",
        s,
        i.map((g, b) => `${g}=${b}`).join(","),
        t
      ].filter(Boolean).join(":");
      if (n.has(l))
        return n.get(l);
      let u = r.sandbox;
      if (!u)
        try {
          a && (u = a.createElement("iframe"), u.id = `__SANDBOX__-${ve()}`, u.width = "0", u.height = "0", u.style.visibility = "hidden", u.style.position = "fixed", a.body.appendChild(u), (y = u.contentWindow) == null || y.document.write('<!DOCTYPE html><meta charset="UTF-8"><title></title><body>'), r.sandbox = u);
        } catch (g) {
          C("Failed to create iframe sandbox", g);
        }
      if (!u)
        return /* @__PURE__ */ new Map();
      const c = u.contentWindow;
      if (!c)
        return /* @__PURE__ */ new Map();
      const f = c.document;
      let d, m;
      o ? (d = f.createElementNS(j, "svg"), m = d.ownerDocument.createElementNS(d.namespaceURI, s), i.forEach(([g, b]) => {
        m.setAttributeNS(null, g, b);
      }), d.appendChild(m)) : d = m = f.createElement(s), m.textContent = " ", f.body.appendChild(d);
      const h = c.getComputedStyle(m, t), w = /* @__PURE__ */ new Map();
      for (let g = h.length, b = 0; b < g; b++) {
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
          let m = s.get(d);
          m || (m = /* @__PURE__ */ new Map(), s.set(d, m)), m.set(l, [u, c]);
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
        const d = [ve()], m = Ne(e, u, n);
        i == null || i.forEach((p, E) => {
          m.delete(E);
        });
        const h = Ie(c, m, n.includeStyleProperties);
        h.delete("content"), h.delete("-webkit-locale"), ((b = h.get("background-clip")) == null ? void 0 : b[0]) === "text" && t.classList.add("______background-clip--text");
        const w = [
          `content: '${f}';`
        ];
        if (h.forEach(([p, E], v) => {
          w.push(`${v}: ${p}${E ? " !important" : ""};`);
        }), w.length === 1)
          return;
        try {
          t.className = [t.className, ...d].join(" ");
        } catch (p) {
          return;
        }
        const y = w.join(`
  `);
        let g = o.get(y);
        g || (g = [], o.set(y, g)), g.push(`.${d[0]}:${u}`);
      }
      St.forEach(l), r && Et.forEach(l);
    }
    function vt(e, t) {
      ne(e) && (t.innerHTML = e.value), (ne(e) || Qe(e) || tt(e)) && t.setAttribute("value", e.value);
    }
    function Tt(e, t, r, n) {
      var f, d, m, h;
      const { ownerWindow: a, includeStyleProperties: s, currentParentNodeStyle: o } = n, i = t.style, l = a.getComputedStyle(e), u = Ne(e, null, n);
      o == null || o.forEach((w, y) => {
        u.delete(y);
      });
      const c = Ie(l, u, s);
      return c.delete("transition-property"), c.delete("all"), c.delete("d"), c.delete("content"), r && (c.delete("margin-top"), c.delete("margin-right"), c.delete("margin-bottom"), c.delete("margin-left"), c.delete("margin-block-start"), c.delete("margin-block-end"), c.delete("margin-inline-start"), c.delete("margin-inline-end"), c.set("box-sizing", ["border-box", ""])), ((f = c.get("background-clip")) == null ? void 0 : f[0]) === "text" && t.classList.add("______background-clip--text"), pe && (c.has("font-kerning") || c.set("font-kerning", ["normal", ""]), (((d = c.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((m = c.get("overflow-y")) == null ? void 0 : m[0]) === "hidden") && ((h = c.get("text-overflow")) == null ? void 0 : h[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && c.set("text-overflow", ["clip", ""])), c.forEach(([w, y], g) => {
        i.setProperty(g, w, y);
      }), c;
    }
    function At(e, t) {
      var r;
      try {
        if ((r = e == null ? void 0 : e.contentDocument) != null && r.body)
          return G(e.contentDocument.body, t);
      } catch (n) {
        C("Failed to clone iframe", n);
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
        C("Failed to clone canvas", a);
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
          if (yield P(t, {
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
            return C("Failed to clone video", s), e.poster ? k(e.poster, e.ownerDocument) : t;
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
      return Ke(e) ? xe(e) : nt(e) ? At(e, t) : D(e) ? It(e) : O(e) ? Nt(e) : e.cloneNode(!1);
    }
    const oe = /* @__PURE__ */ new Set([
      "symbol"
      // test/fixtures/svg.symbol.html
    ]);
    function ae(e, t, r, n) {
      return S(this, null, function* () {
        if (A(r) && (Ze(r) || et(r)) || n.filter && !n.filter(r))
          return;
        oe.has(t.nodeName) || oe.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
        const a = yield G(r, n);
        n.isEnable("restoreScrollPosition") && kt(e, a), t.appendChild(a);
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
                yield ae(e, t, i[l], r);
            } else
              yield ae(e, t, o, r);
      });
    }
    function kt(e, t) {
      if (!F(e) || !F(t))
        return;
      const { scrollTop: r, scrollLeft: n } = e;
      if (!r && !n)
        return;
      const { transform: a } = t.style, s = new DOMMatrix(a), { a: o, b: i, c: l, d: u } = s;
      s.a = 1, s.b = 0, s.c = 0, s.d = 1, s.translateSelf(-n, -r), s.a = o, s.b = i, s.c = l, s.d = u, t.style.transform = s.toString();
    }
    function Rt(e, t) {
      const { backgroundColor: r, width: n, height: a, style: s } = t, o = e.style;
      if (r && o.setProperty("background-color", r, "important"), n && o.setProperty("width", `${n}px`, "important"), a && o.setProperty("height", `${a}px`, "important"), s)
        for (const i in s)
          o[i] = s[i];
    }
    const Dt = /^[\w-:]+$/;
    function G(e, t, r = !1) {
      return S(this, null, function* () {
        var i, l, u, c;
        const { ownerDocument: n, ownerWindow: a, fontFamilies: s } = t;
        if (n && Je(e))
          return n.createTextNode(e.data);
        if (n && a && A(e) && (F(e) || U(e))) {
          const f = yield xt(e, t);
          if (t.isEnable("removeAbnormalAttributes")) {
            const h = f.getAttributeNames();
            for (let w = h.length, y = 0; y < w; y++) {
              const g = h[y];
              Dt.test(g) || f.removeAttribute(g);
            }
          }
          const d = t.currentNodeStyle = Tt(e, f, r, t);
          r && Rt(f, t);
          let m = !1;
          if (t.isEnable("copyScrollbar")) {
            const h = [
              (i = d.get("overflow-x")) == null ? void 0 : i[0],
              (l = d.get("overflow-y")) == null ? void 0 : l[1]
            ];
            m = h.includes("scroll") || (h.includes("auto") || h.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
          }
          return Ct(e, f, m, t), vt(e, f), (c = Te((u = d.get("font-family")) == null ? void 0 : u[0])) == null || c.forEach((h) => s.add(h)), O(e) || (yield se(e, f, t)), f;
        }
        const o = e.cloneNode(!1);
        return yield se(e, o, t), o;
      });
    }
    function Ft(e) {
      if (e.ownerDocument = void 0, e.ownerWindow = void 0, e.svgStyleElement = void 0, e.svgDefsElement = void 0, e.svgStyles.clear(), e.defaultComputedStyles.clear(), e.sandbox) {
        try {
          e.sandbox.remove();
        } catch (t) {
        }
        e.sandbox = void 0;
      }
      e.workers = [], e.fontFamilies.clear(), e.fontCssTexts.clear(), e.requests.clear(), e.tasks = [];
    }
    function Pt(e) {
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
          placeholderImage: m
        },
        workers: h
      } = e;
      n === "image" && (M || X) && e.drawImageCount++;
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
            const g = yield c(r);
            if (g)
              return g;
          }
          return !M && r.startsWith("http") && h.length ? new Promise((g, b) => {
            h[u.size & h.length - 1].postMessage(T({ rawUrl: r }, y)), w.resolve = g, w.reject = b;
          }) : Pt(y);
        }))().catch((g) => {
          if (u.delete(r), n === "image" && m)
            return C("Failed to fetch image base64, trying to use placeholder image", o), typeof m == "string" ? m : m(s);
          throw g;
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
            C("Failed to fetch css data url", a, o);
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
    function $t(e, t) {
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
                return C(`Error while reading CSS rules from ${c.href}`, f), !1;
              }
            });
            yield Promise.all(
              l.flatMap((c) => Array.from(c.cssRules).map((f, d) => S(this, null, function* () {
                if (Xe(f)) {
                  let m = d + 1;
                  const h = f.href;
                  let w = "";
                  try {
                    w = yield _(t, {
                      url: h,
                      requestType: "text",
                      responseType: "text"
                    });
                  } catch (g) {
                    C(`Error fetch remote css import from ${h}`, g);
                  }
                  const y = w.replace(
                    De,
                    (g, b, p) => g.replace(p, be(p, h))
                  );
                  for (const g of Lt(y))
                    try {
                      c.insertRule(
                        g,
                        g.startsWith("@import") ? m += 1 : c.cssRules.length
                      );
                    } catch (b) {
                      C("Error inserting rule from remote css import", { rule: g, error: b });
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
                ).then((m) => {
                  m = ce(m, t), s.set(f.cssText, m), n.appendChild(r.createTextNode(`${m}
`));
                })
              );
            });
          }
      });
    }
    const Bt = /(\/\*[\s\S]*?\*\/)/gi, ie = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
    function Lt(e) {
      if (e == null)
        return [];
      const t = [];
      let r = e.replace(Bt, "");
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
    const Mt = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Ot = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
    function ce(e, t) {
      const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
      return n ? e.replace(Ot, (a) => {
        for (; ; ) {
          const [s, , o] = Mt.exec(a) || [];
          if (!o)
            return "";
          if (o === n)
            return `src: ${s};`;
        }
      }) : e;
    }
    function Wt(e, t) {
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
        (M || X) && t.drawImageCount++;
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
    const jt = [
      "background-image",
      "border-image-source",
      "-webkit-border-image",
      "-webkit-mask-image",
      "list-style-image"
    ];
    function qt(e, t) {
      return jt.map((r) => {
        const n = e.getPropertyValue(r);
        return !n || n === "none" ? null : ((M || X) && t.drawImageCount++, ke(n, null, t, !0).then((a) => {
          !a || n === a || e.setProperty(
            r,
            a,
            e.getPropertyPriority(r)
          );
        }));
      }).filter(Boolean);
    }
    function Vt(e, t) {
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
          return n == null || n.appendChild(u.cloneNode(!0)), [];
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
      A(e) && ((D(e) || ye(e)) && r.push(...Wt(e, t)), Ge(e) && r.push(...Vt(e, t))), F(e) && r.push(...qt(e.style, t)), e.childNodes.forEach((n) => {
        Fe(n, t);
      });
    }
    function Ht(e, t) {
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
          onEmbedNode: m,
          onCreateForeignObjectSvg: h
        } = r;
        a.time("clone node");
        const w = yield G(r.node, r, !0);
        if (o && n) {
          let E = "";
          l.forEach((v, I) => {
            E += `${v.join(`,
`)} {
  ${I}
}
`;
          }), o.appendChild(n.createTextNode(E));
        }
        a.timeEnd("clone node"), d == null || d(w), u !== !1 && A(w) && (a.time("embed web font"), yield $t(w, r), a.timeEnd("embed web font")), a.time("embed node"), Fe(w, r);
        const y = s.length;
        let g = 0;
        const b = () => S(this, null, function* () {
          for (; ; ) {
            const E = s.pop();
            if (!E)
              break;
            try {
              yield E;
            } catch (v) {
              C("Failed to run task", v);
            }
            c == null || c(++g, y);
          }
        });
        c == null || c(g, y), yield Promise.all([...Array(4)].map(b)), a.timeEnd("embed node"), m == null || m(w);
        const p = zt(w, r);
        return i && p.insertBefore(i, p.children[0]), o && p.insertBefore(o, p.children[0]), f && Ft(r), h == null || h(p), p;
      });
    }
    function zt(e, t) {
      const { width: r, height: n } = t, a = Se(r, n, e.ownerDocument), s = a.ownerDocument.createElementNS(a.namespaceURI, "foreignObject");
      return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), a.appendChild(s), a;
    }
    function Y(e, t) {
      return S(this, null, function* () {
        var o;
        const r = yield N(e, t), n = yield Ht(r), a = Ee(n, r.isEnable("removeControlCharacter"));
        r.autoDestruct || (r.svgStyleElement = Ae(r.ownerDocument), r.svgDefsElement = (o = r.ownerDocument) == null ? void 0 : o.createElementNS(j, "defs"), r.svgStyles.clear());
        const s = k(a, n.ownerDocument);
        return yield wt(s, r);
      });
    }
    function Yt(e, t) {
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

    let is_chord = (x) => { try { return 'index' in x } catch { return false } };
    let not_chord = (x) => { try { return !is_chord(x) } catch { return true } }; // !x || (x.type && (x.type == "break" || x.type == "comment"))
    class Note {
        constructor(value, playTime, tempo, BPM, delta, shifts='keep', oors='keep') {
            this.original   =  value;
            this.value      =  value;
            this.playTime   =  playTime;
            this.delta      =  delta;
            this.char       =  vpScale[value - firstPossibleNote];
            this.tempo      =  tempo;
            this.BPM        =  BPM;
            
            // Only correct at runtime
            this.transposition = () => this.value - this.original;

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
        
        new_with_saved_original(newValue) {
            let result = new Note(newValue, this.playTime, this.tempo, this.BPM, this.delta, this.shifts, this.oors);
            result.original = this.original;
            return result
        }
    }

    class Chord$1 {
        constructor(notes, classicChordOrder = true, sequentialQuantize = true) {
            let is_quantized = false;
            let previous_note = notes[0];
            
            // console.log(previous_note);
            
            this.classicChordOrder = classicChordOrder;
            this.sequentialQuantize = sequentialQuantize;

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
                if (sequentialQuantize) {
                    this.notes = notes.sort((a, b) => a.playTime - b.playTime);
                }
                else {
                    this.notes = this.#sortChord(notes, classicChordOrder);
                }
            }
        }
        
        transpose = (by, relative = false, mutate = false) => {
            if (relative) {
                by = this.notes[0].transposition() + by;
            }
            
            let new_chord = new Chord$1(this.notes, this.classicChordOrder, this.sequentialQuantize);
            for (let i = 0; i < new_chord.notes.length; i++) {
                let assignee = mutate ? this : new_chord; 
                let new_notes = assignee.notes.map(note => note.new_with_saved_original(note.original + by)); // create a note with the correct "original" value
                new_chord = new Chord$1(new_notes, this.classicChordOrder, this.sequentialQuantize);
                assignee.notes = new_chord.notes;
            }

            return new_chord
        }
        
        display = () => {
            if (!this.notes[0]?.char) return '?'

            else if (this.notes.length == 1) {
                return this.notes[0].char
            }

            else {
                let result = [];
                for (let note of this.notes) {
                    result.push(note.char ?? '?');
                }
                return '[' + result.join('') + ']'
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

    function generateChords(events /* Only NOTE_ON & SET_TEMPO events */, settings, chords_and_otherwise = undefined) {
        const error_range = 0.5;
        let penalty = 0.000;

        function shouldBreak(note, penalty) {
            // console.log("tobreak:", note)
            if (!note) return false
            let tempo_ms = note.tempo / 1000; // turn 6/52174 into 652.174
            let goal = tempo_ms * settings.beats;
            let normalizedplaytime = note.playTime - penalty;
            // console.log(normalizedplaytime + error_range)
            // console.log(goal)
            if (normalizedplaytime + error_range >= goal) {
                // console.log("BREAKING!")
                return {doBreak: true, newPenalty: penalty + normalizedplaytime}
            }
            return {doBreak: false, newPenalty: penalty}
        }

        // console.log(settings)

        let quantize = settings.quantize;
        let shifts = settings.pShifts;
        let oors = settings.pOors;
        let classicChordOrder = settings.classicChordOrder;
        let sequentialQuantize = settings.sequentialQuantize;
        let bpm = settings.bpm;

        let chords = [];
        let current_notes = [];
        let lastPlaytime = undefined;

        let previousBPM = undefined;
        let previousTempo = undefined;

        let nextBPM = bpm;
        let nextTempo = bpm*4166.66; // Magic number

        function validNoteSpeed(event) {
            return event.tempo && event.tempoBPM && event.tempo !== 0 && event.tempoBPM !== 0
        }

        let index = 0;
        // Generate chords
        events.forEach(element => {
            // if event is SET_TEMPO
            if (element.subtype == 0x51 && validNoteSpeed(element)) {
                nextTempo = element.tempo;
                nextBPM = element.tempoBPM;
                if (previousTempo == undefined) {
                    if(settings.bpmChanges)
                        chords.push({ type: 'comment', kind: 'tempo', text: `Tempo: ${Math.round(element.tempoBPM)} BPM` });
                }
                else if (previousTempo != undefined && (previousTempo != element.tempo) && (previousBPM != element.tempoBPM)) {
                    if(settings.bpmChanges) {
                        let newBPM = Math.round(element.tempoBPM);
                        
                        let larger = newBPM > previousBPM ? newBPM : previousBPM;
                        let smaller = newBPM < previousBPM ? newBPM : previousBPM;
                        
                        let percent = ((larger - smaller) / smaller) * 100;
                        
                        if (percent < settings.minSpeedChange) return
                        // chords.push({ type: 'comment', text: `BPM change to ${Math.round(element.tempoBPM)} (${Math.round(percent)}% ${newBPM > previousBPM ? 'faster' : 'slower'})` })
                        chords.push({ type: 'comment', kind: 'tempo', text: `${Math.round(percent)}% ${newBPM > previousBPM ? 'faster' : 'slower'} - BPM changed to ${Math.round(element.tempoBPM)}` });
                    }
                }
                previousBPM = element.tempoBPM;
                previousTempo = element.tempo;
                return
            } 
            // event is NOTE_ON
            const key      = element.param1;
            const playtime = element.playTime;
            const delta    = element.delta;
            
            if (!key) return

            if (lastPlaytime == undefined)
                lastPlaytime = playtime;

            if (Math.abs(playtime - lastPlaytime) < quantize) {
                current_notes.push(new Note(key, playtime, nextTempo, nextBPM, delta, shifts, oors));
                lastPlaytime = playtime;
            } else {
                if (current_notes.length == 0) {
                    lastPlaytime = playtime;
                    return
                }

                // Submit the chord and start the next one
                let resulting_chord = new Chord$1(current_notes, classicChordOrder, sequentialQuantize);
                resulting_chord.index = index;
                
                // Transpose to previous
                let same_chord_that_existed_previously = undefined;
                if (chords_and_otherwise)
                    same_chord_that_existed_previously = chords_and_otherwise[index_of_index(chords_and_otherwise, index)];
                // console.log(same_chord_that_existed_previously, index, chords_and_otherwise)
                if (same_chord_that_existed_previously && ![0, undefined].includes(same_chord_that_existed_previously?.notes?.[0].transposition())) {
                    resulting_chord.transpose(same_chord_that_existed_previously.notes[0].transposition(), false, true);
                }
                else {console.log("not keeping");}
                
                chords.push(resulting_chord);
                index++;

                current_notes = [];
                current_notes.push(new Note(key, playtime, nextTempo, nextBPM, delta, shifts, oors));

                lastPlaytime = playtime;
            }

            const { doBreak, newPenalty } = shouldBreak(current_notes[0], penalty);
            penalty = newPenalty;
            if(doBreak) { chords.push({type: 'break'}); }
        });

        // Final chord insertion to make sure no notes are left
        // chords.push(new Chord(currentChord, classicChordOrder))
        let resulting_chord = new Chord$1(current_notes, classicChordOrder, sequentialQuantize);
        resulting_chord.index = index;

        // Transpose to previous
        let same_chord_that_existed_previously = undefined;
        if (chords_and_otherwise)
            same_chord_that_existed_previously = chords_and_otherwise[index_of_index(chords_and_otherwise, index)];
        // console.log(same_chord_that_existed_previously, index, chords_and_otherwise)
        if (same_chord_that_existed_previously && ![0, undefined].includes(same_chord_that_existed_previously?.notes?.[0].transposition())) {
            resulting_chord.transpose(same_chord_that_existed_previously.notes[0].transposition(), false, true);
        }

        chords.push(resulting_chord);
        
        index++;

        if (!previousTempo)
            console.log(`No tempo found in sheet, set to ${nextBPM}/${nextTempo}`); 

        // resultingSheet.missingTempo = !hasTempo

        return chords
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

    /* Higher is better */
    function score(chord) {
        let good_notes = chord.notes.filter(note => note.outOfRange === false && note.valid === true);
       
        let lowercase_notes = good_notes.filter(note => lowercases.includes(note.char));
        let uppercase_notes = good_notes.filter(note => !(lowercases.includes(note.char)));

        return ((good_notes.length * 2) + Math.abs(uppercase_notes.length-lowercase_notes.length))
    }

    function best_transposition_for_chord(chord, deviation, stickTo = 0, resilience = 0) {
        if (!chord) return

        // console.log(chord)
        
        // console.log('[btfc] entry:', chord.display())
        if (not_chord(chord)) return stickTo
        
        let best_transpositions = [stickTo];
        
        // reconsider: oors are valid notes
        chord.notes.filter(note => note.outOfRange === false && note.valid === true).length;
        // console.log('goodnote count: ' + good_note_count)
        
        // let at_least_this_much_better = goodnote_count / 2

        let best_score = score(chord.transpose(stickTo));
        
        let consider = (n) => {
            let attempt_score = score(chord.transpose(n));
            if (attempt_score > best_score) {
                // console.log(`transposed by ${n} is better than ${best_transpositions} (${attempt_score} > ${best_score})`)
                best_score = attempt_score;
                best_transpositions = [n];
            }
            else if (attempt_score == best_score) {
                if(n == 0 && best_transpositions.includes(0)) return attempt_score // prevent 0 & -0
                // console.log(`transposed by ${n} is equal to best transposition (${attempt_score} == ${best_score}), appending`)
                best_transpositions.push(n);
            }
            return attempt_score
        };
        
        for (let i = +stickTo; i <= deviation; i++) {
            // console.log(`transposed by +${+i}: ${chord.transpose(+i).display()}; score: ${score(chord.transpose(+i))}`)
            consider(+i);
            // console.log(`transposed by ${-i}: ${chord.transpose(-i).display()}; score: ${score(chord.transpose(-i))}`)
            consider(-i);
        }
        
        // console.log(`best transposition for ${chord.display()} is ${best_transpositions} (${chord.transpose(best_transpositions).display()})`)

        return best_transpositions
    }

    function best_transposition_for_chords(chords, deviation, stickTo = 0, resilience = 4) {
        // console.log('[btfcs] entry:', chords)
        
        let best_transpositions_for_each_chord = chords.map((chord) => best_transposition_for_chord(chord, deviation, stickTo, resilience));
        // console.log('best transpositions for each chord: ', best_transpositions_for_each_chord)
        
        // // Most occurences of a single transposition (TODO: maybe reconsider)
        let best_count = 0;
        let best_transposition_overall = 0;
        let seen = [];
        
        // mono type thing
        best_transpositions_for_each_chord = best_transpositions_for_each_chord.flat();

        for (let transposition of best_transpositions_for_each_chord) {
            if (seen.includes(transposition)) continue
            seen.push(transposition);

            let occurences = best_transpositions_for_each_chord.filter(x => x == transposition);
            let count = occurences.length;
            if (count > best_count + resilience/2) {
                best_count = count;
                best_transposition_overall = transposition;
            }
        }
        
        // console.log(best_transposition_overall)
        
        return best_transposition_overall
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

    // chatgpt binary search
    function index_of_index(arr, targetIndex) {
        if(!arr) return
        let left = 0;
        let right = arr.length - 1;

        while (left <= right) {
            let mid = Math.floor((left + right) / 2);

            // Find the closest element with an index on the left
            while (mid >= left && !('index' in arr[mid])) {
                mid--;
            }

            if (mid < left) {
                left = Math.floor((left + right) / 2) + 1;
                continue;
            }

            if (arr[mid].index === targetIndex) {
                return mid; // Element found
            } else if (arr[mid].index < targetIndex) {
                left = mid + 1; // Continue search on the right half
            } else {
                right = mid - 1; // Continue search on the left half
            }
        }

        return undefined; // Element not found
    }

    /* src\components\SheetOptions.svelte generated by Svelte v3.55.1 */
    const file$6 = "src\\components\\SheetOptions.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    // (35:0) {#if show}
    function create_if_block$2(ctx) {
    	let hr0;
    	let t0;
    	let div1;
    	let div0;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let span0;
    	let t4_value = /*settings*/ ctx[0].resilience + "";
    	let t4;
    	let t5;
    	let hr1;
    	let t6;
    	let div8;
    	let div2;
    	let label1;
    	let t8;
    	let select0;
    	let option0;
    	let option1;
    	let select0_disabled_value;
    	let select0_title_value;
    	let t11;
    	let div3;
    	let label2;
    	let t13;
    	let select1;
    	let option2;
    	let option3;
    	let option4;
    	let t17;
    	let hr2;
    	let t18;
    	let t19;
    	let t20;
    	let t21;
    	let label3;
    	let input1;
    	let t22;
    	let t23;
    	let label4;
    	let input2;
    	let t24;
    	let t25;
    	let label5;
    	let input3;
    	let t26;
    	let t27;
    	let div4;
    	let t28;
    	let label6;
    	let input4;
    	let t29;
    	let t30;
    	let hr3;
    	let t31;
    	let label7;
    	let input5;
    	let t32;
    	let t33;
    	let label8;
    	let input6;
    	let t34;
    	let t35;
    	let t36;
    	let t37;
    	let hr4;
    	let t38;
    	let div5;
    	let label9;
    	let t40;
    	let select2;
    	let t41;
    	let div7;
    	let div6;
    	let label10;
    	let t43;
    	let input7;
    	let t44;
    	let span1;
    	let t45_value = /*settings*/ ctx[0].lineHeight + "";
    	let t45;
    	let t46;
    	let hr5;
    	let t47;
    	let style;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*hasMIDI*/ ctx[2]) return create_if_block_6$1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*settings*/ ctx[0].missingTempo == true && create_if_block_5$1(ctx);
    	let if_block2 = /*hasMIDI*/ ctx[2] && create_if_block_4$1(ctx);
    	let if_block3 = /*hasMIDI*/ ctx[2] && create_if_block_2$2(ctx);
    	let if_block4 = /*settings*/ ctx[0].oors && /*settings*/ ctx[0].oorMarks && create_if_block_1$2(ctx);
    	let each_value = /*fonts*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			hr0 = element("hr");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Resilience (?):";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			span0 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			hr1 = element("hr");
    			t6 = space();
    			div8 = element("div");
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Place shifted notes at:";
    			t8 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Start";
    			option1 = element("option");
    			option1.textContent = "End";
    			t11 = space();
    			div3 = element("div");
    			label2 = element("label");
    			label2.textContent = "Place out of range notes at:";
    			t13 = space();
    			select1 = element("select");
    			option2 = element("option");
    			option2.textContent = "Inorder";
    			option3 = element("option");
    			option3.textContent = "Start";
    			option4 = element("option");
    			option4.textContent = "End";
    			t17 = space();
    			hr2 = element("hr");
    			t18 = space();
    			if_block0.c();
    			t19 = space();
    			if (if_block1) if_block1.c();
    			t20 = space();
    			if (if_block2) if_block2.c();
    			t21 = space();
    			label3 = element("label");
    			input1 = element("input");
    			t22 = text("\n        Classic chord order");
    			t23 = space();
    			label4 = element("label");
    			input2 = element("input");
    			t24 = text("\n        Sequential quantizes");
    			t25 = space();
    			label5 = element("label");
    			input3 = element("input");
    			t26 = text("\n        Curly braces for quantized chords");
    			t27 = space();
    			div4 = element("div");
    			t28 = space();
    			label6 = element("label");
    			input4 = element("input");
    			t29 = text("\n        Include out of range (ctrl) notes");
    			t30 = space();
    			hr3 = element("hr");
    			t31 = space();
    			label7 = element("label");
    			input5 = element("input");
    			t32 = text("\n        Show tempo/timing marks");
    			t33 = space();
    			label8 = element("label");
    			input6 = element("input");
    			t34 = text("\n        Show out of range (ctrl) text marks");
    			t35 = space();
    			if (if_block3) if_block3.c();
    			t36 = space();
    			if (if_block4) if_block4.c();
    			t37 = space();
    			hr4 = element("hr");
    			t38 = space();
    			div5 = element("div");
    			label9 = element("label");
    			label9.textContent = "Font:";
    			t40 = space();
    			select2 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t41 = space();
    			div7 = element("div");
    			div6 = element("div");
    			label10 = element("label");
    			label10.textContent = "Line height:";
    			t43 = space();
    			input7 = element("input");
    			t44 = space();
    			span1 = element("span");
    			t45 = text(t45_value);
    			t46 = space();
    			hr5 = element("hr");
    			t47 = space();
    			style = element("style");
    			style.textContent = "* {\n        user-select: none;\n    }\n\n    label {\n        max-width: fit-content;\n        text-align: center;\n    }\n\n    .select-div {\n        display: flex;\n        flex-direction: row;\n        align-items: center;\n        text-align: center;\n    }\n\n    select {\n        height: auto;\n        margin-left: 0.4em;\n        margin-top: 0.2em;\n        margin-bottom: 0;\n    }\n    \n    select option {\n        background: #2D2A32;\n    }\n\n    input[type=\"checkbox\"] {\n        display: inline-block;\n        vertical-align: middle;\n    }\n\n    input[type=\"range\"] {\n        margin-left: 0.4em;\n        margin-right: 0.4em;\n        margin-bottom: 0;\n    }\n\n    input[type=\"file\"] {\n        margin-bottom: 0;\n    }\n\n    input[type=\"text\"] {\n        margin-bottom: 0;\n    }\n    \n    .beats, .select-label, .tempo {\n        display: flex;\n        flex-direction: row;\n    }";
    			attr_dev(hr0, "class", "my-2 mx-1");
    			add_location(hr0, file$6, 36, 0, 854);
    			attr_dev(label0, "class", "flex flex-row items-center");
    			attr_dev(label0, "title", "Defines how much better a transposition should be than the previous transposition for multi-transpose to act (higher = less transposing)");
    			attr_dev(label0, "for", "atleast");
    			add_location(label0, file$6, 40, 8, 1003);
    			attr_dev(input0, "class", "w-32");
    			attr_dev(input0, "id", "atleast");
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "12");
    			add_location(input0, file$6, 43, 8, 1267);
    			set_style(span0, "display", "flex");
    			set_style(span0, "align-items", "center");
    			add_location(span0, file$6, 44, 8, 1368);
    			attr_dev(div0, "class", "flex flex-row mt-3");
    			add_location(div0, file$6, 39, 4, 962);
    			attr_dev(div1, "class", "flex flex-col items-start align-middle");
    			set_style(div1, "margin-top", "-0.7em");
    			add_location(div1, file$6, 38, 0, 878);
    			attr_dev(hr1, "class", "my-2 mx-1");
    			add_location(hr1, file$6, 48, 0, 1464);
    			attr_dev(label1, "for", "shifts-position");
    			add_location(label1, file$6, 53, 8, 1558);
    			option0.__value = "Start";
    			option0.value = option0.__value;
    			add_location(option0, file$6, 56, 12, 1872);
    			option1.__value = "End";
    			option1.value = option1.__value;
    			add_location(option1, file$6, 57, 12, 1921);
    			select0.disabled = select0_disabled_value = /*settings*/ ctx[0].classicChordOrder;

    			attr_dev(select0, "title", select0_title_value = /*settings*/ ctx[0].classicChordOrder
    			? "Disable \"Classic chord order\" to customize this."
    			: "");

    			attr_dev(select0, "name", "shifts-position");
    			attr_dev(select0, "id", "shifts-position");
    			if (/*settings*/ ctx[0].pShifts === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[5].call(select0));
    			add_location(select0, file$6, 54, 8, 1627);
    			attr_dev(div2, "class", "select-div");
    			add_location(div2, file$6, 52, 4, 1525);
    			attr_dev(label2, "for", "oors-position");
    			add_location(label2, file$6, 62, 8, 2021);
    			option2.__value = "Inorder";
    			option2.value = option2.__value;
    			add_location(option2, file$6, 64, 12, 2182);
    			option3.__value = "Start";
    			option3.value = option3.__value;
    			add_location(option3, file$6, 65, 12, 2235);
    			option4.__value = "End";
    			option4.value = option4.__value;
    			add_location(option4, file$6, 66, 12, 2284);
    			attr_dev(select1, "name", "oors-position");
    			attr_dev(select1, "id", "oors-position");
    			if (/*settings*/ ctx[0].pOors === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[6].call(select1));
    			add_location(select1, file$6, 63, 8, 2093);
    			attr_dev(div3, "class", "select-div");
    			add_location(div3, file$6, 61, 4, 1988);
    			attr_dev(hr2, "class", "my-2 mx-1");
    			add_location(hr2, file$6, 70, 4, 2351);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "id", "classic-chord-order");
    			add_location(input1, file$6, 102, 8, 3663);
    			attr_dev(label3, "for", "classic-chord-order");
    			add_location(label3, file$6, 101, 4, 3621);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "id", "order-quantizes");
    			add_location(input2, file$6, 107, 8, 3838);
    			attr_dev(label4, "for", "order-quantizes");
    			add_location(label4, file$6, 106, 4, 3800);
    			attr_dev(input3, "type", "checkbox");
    			attr_dev(input3, "id", "curly-quantizes");
    			add_location(input3, file$6, 112, 8, 4011);
    			attr_dev(label5, "for", "curly-quantizes");
    			add_location(label5, file$6, 111, 4, 3973);
    			add_location(div4, file$6, 116, 4, 4155);
    			attr_dev(input4, "type", "checkbox");
    			attr_dev(input4, "id", "out-of-range");
    			add_location(input4, file$6, 118, 8, 4206);
    			attr_dev(label6, "for", "out-of-range");
    			add_location(label6, file$6, 117, 4, 4171);
    			attr_dev(hr3, "class", "my-2 mx-1");
    			add_location(hr3, file$6, 122, 4, 4337);
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "id", "tempo-checkbox");
    			add_location(input5, file$6, 125, 8, 4402);
    			attr_dev(label7, "for", "tempo-checkbox");
    			add_location(label7, file$6, 124, 4, 4365);
    			attr_dev(input6, "type", "checkbox");
    			attr_dev(input6, "id", "oormark-checkbox");
    			add_location(input6, file$6, 130, 8, 4571);
    			attr_dev(label8, "for", "oormark-checkbox");
    			add_location(label8, file$6, 129, 4, 4532);
    			attr_dev(hr4, "class", "my-2 mx-1");
    			add_location(hr4, file$6, 170, 4, 6220);
    			attr_dev(label9, "for", "font");
    			add_location(label9, file$6, 173, 8, 6281);
    			attr_dev(select2, "name", "font");
    			attr_dev(select2, "id", "font");
    			if (/*settings*/ ctx[0].font === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[21].call(select2));
    			add_location(select2, file$6, 174, 8, 6321);
    			attr_dev(div5, "class", "select-div");
    			add_location(div5, file$6, 172, 4, 6248);
    			attr_dev(label10, "class", "flex flex-row items-center");
    			attr_dev(label10, "for", "line-height");
    			add_location(label10, file$6, 183, 12, 6653);
    			attr_dev(input7, "class", "w-32");
    			attr_dev(input7, "id", "line-height");
    			attr_dev(input7, "type", "range");
    			attr_dev(input7, "min", "110");
    			attr_dev(input7, "max", "160");
    			add_location(input7, file$6, 185, 12, 6765);
    			set_style(span1, "display", "flex");
    			set_style(span1, "align-items", "center");
    			add_location(span1, file$6, 186, 12, 6877);
    			attr_dev(div6, "class", "flex flex-row mt-3");
    			add_location(div6, file$6, 182, 8, 6608);
    			attr_dev(div7, "class", "flex flex-col items-start align-middle");
    			set_style(div7, "margin-top", "-0.3em");
    			add_location(div7, file$6, 181, 4, 6520);
    			attr_dev(hr5, "class", "my-2 mx-1");
    			add_location(hr5, file$6, 190, 4, 6985);
    			add_location(div8, file$6, 50, 0, 1488);
    			add_location(style, file$6, 194, 0, 7017);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t2);
    			append_dev(div0, input0);
    			set_input_value(input0, /*settings*/ ctx[0].resilience);
    			append_dev(div0, t3);
    			append_dev(div0, span0);
    			append_dev(span0, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t8);
    			append_dev(div2, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			select_option(select0, /*settings*/ ctx[0].pShifts);
    			append_dev(div8, t11);
    			append_dev(div8, div3);
    			append_dev(div3, label2);
    			append_dev(div3, t13);
    			append_dev(div3, select1);
    			append_dev(select1, option2);
    			append_dev(select1, option3);
    			append_dev(select1, option4);
    			select_option(select1, /*settings*/ ctx[0].pOors);
    			append_dev(div8, t17);
    			append_dev(div8, hr2);
    			append_dev(div8, t18);
    			if_block0.m(div8, null);
    			append_dev(div8, t19);
    			if (if_block1) if_block1.m(div8, null);
    			append_dev(div8, t20);
    			if (if_block2) if_block2.m(div8, null);
    			append_dev(div8, t21);
    			append_dev(div8, label3);
    			append_dev(label3, input1);
    			input1.checked = /*settings*/ ctx[0].classicChordOrder;
    			append_dev(label3, t22);
    			append_dev(div8, t23);
    			append_dev(div8, label4);
    			append_dev(label4, input2);
    			input2.checked = /*settings*/ ctx[0].sequentialQuantize;
    			append_dev(label4, t24);
    			append_dev(div8, t25);
    			append_dev(div8, label5);
    			append_dev(label5, input3);
    			input3.checked = /*settings*/ ctx[0].curlyQuantizes;
    			append_dev(label5, t26);
    			append_dev(div8, t27);
    			append_dev(div8, div4);
    			append_dev(div8, t28);
    			append_dev(div8, label6);
    			append_dev(label6, input4);
    			input4.checked = /*settings*/ ctx[0].oors;
    			append_dev(label6, t29);
    			append_dev(div8, t30);
    			append_dev(div8, hr3);
    			append_dev(div8, t31);
    			append_dev(div8, label7);
    			append_dev(label7, input5);
    			input5.checked = /*settings*/ ctx[0].tempoMarks;
    			append_dev(label7, t32);
    			append_dev(div8, t33);
    			append_dev(div8, label8);
    			append_dev(label8, input6);
    			input6.checked = /*settings*/ ctx[0].oorMarks;
    			append_dev(label8, t34);
    			append_dev(div8, t35);
    			if (if_block3) if_block3.m(div8, null);
    			append_dev(div8, t36);
    			if (if_block4) if_block4.m(div8, null);
    			append_dev(div8, t37);
    			append_dev(div8, hr4);
    			append_dev(div8, t38);
    			append_dev(div8, div5);
    			append_dev(div5, label9);
    			append_dev(div5, t40);
    			append_dev(div5, select2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select2, null);
    			}

    			select_option(select2, /*settings*/ ctx[0].font);
    			append_dev(div8, t41);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, label10);
    			append_dev(div6, t43);
    			append_dev(div6, input7);
    			set_input_value(input7, /*settings*/ ctx[0].lineHeight);
    			append_dev(div6, t44);
    			append_dev(div6, span1);
    			append_dev(span1, t45);
    			append_dev(div8, t46);
    			append_dev(div8, hr5);
    			insert_dev(target, t47, anchor);
    			insert_dev(target, style, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[4]),
    					listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[4]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[5]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[6]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[11]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[12]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[13]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[14]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[15]),
    					listen_dev(input6, "change", /*input6_change_handler*/ ctx[16]),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[21]),
    					listen_dev(input7, "change", /*input7_change_input_handler*/ ctx[22]),
    					listen_dev(input7, "input", /*input7_change_input_handler*/ ctx[22])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*settings*/ 1) {
    				set_input_value(input0, /*settings*/ ctx[0].resilience);
    			}

    			if (dirty & /*settings*/ 1 && t4_value !== (t4_value = /*settings*/ ctx[0].resilience + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*settings*/ 1 && select0_disabled_value !== (select0_disabled_value = /*settings*/ ctx[0].classicChordOrder)) {
    				prop_dev(select0, "disabled", select0_disabled_value);
    			}

    			if (dirty & /*settings*/ 1 && select0_title_value !== (select0_title_value = /*settings*/ ctx[0].classicChordOrder
    			? "Disable \"Classic chord order\" to customize this."
    			: "")) {
    				attr_dev(select0, "title", select0_title_value);
    			}

    			if (dirty & /*settings*/ 1) {
    				select_option(select0, /*settings*/ ctx[0].pShifts);
    			}

    			if (dirty & /*settings*/ 1) {
    				select_option(select1, /*settings*/ ctx[0].pOors);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div8, t19);
    				}
    			}

    			if (/*settings*/ ctx[0].missingTempo == true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$1(ctx);
    					if_block1.c();
    					if_block1.m(div8, t20);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*hasMIDI*/ ctx[2]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4$1(ctx);
    					if_block2.c();
    					if_block2.m(div8, t21);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*settings*/ 1) {
    				input1.checked = /*settings*/ ctx[0].classicChordOrder;
    			}

    			if (dirty & /*settings*/ 1) {
    				input2.checked = /*settings*/ ctx[0].sequentialQuantize;
    			}

    			if (dirty & /*settings*/ 1) {
    				input3.checked = /*settings*/ ctx[0].curlyQuantizes;
    			}

    			if (dirty & /*settings*/ 1) {
    				input4.checked = /*settings*/ ctx[0].oors;
    			}

    			if (dirty & /*settings*/ 1) {
    				input5.checked = /*settings*/ ctx[0].tempoMarks;
    			}

    			if (dirty & /*settings*/ 1) {
    				input6.checked = /*settings*/ ctx[0].oorMarks;
    			}

    			if (/*hasMIDI*/ ctx[2]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2$2(ctx);
    					if_block3.c();
    					if_block3.m(div8, t36);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*settings*/ ctx[0].oors && /*settings*/ ctx[0].oorMarks) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_1$2(ctx);
    					if_block4.c();
    					if_block4.m(div8, t37);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
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
    				set_input_value(input7, /*settings*/ ctx[0].lineHeight);
    			}

    			if (dirty & /*settings*/ 1 && t45_value !== (t45_value = /*settings*/ ctx[0].lineHeight + "")) set_data_dev(t45, t45_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div8);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t47);
    			if (detaching) detach_dev(style);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(35:0) {#if show}",
    		ctx
    	});

    	return block;
    }

    // (80:4) {:else}
    function create_else_block$2(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			i.textContent = "Some settings are not available because the original MIDI data is missing.";
    			add_location(i, file$6, 80, 8, 2750);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(80:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (74:4) {#if hasMIDI}
    function create_if_block_6$1(ctx) {
    	let div;
    	let label;
    	let t1;
    	let input;
    	let t2;
    	let span;
    	let t3;

    	let t4_value = (/*settings*/ ctx[0].beats == 1
    	? "1 beat"
    	: `${/*settings*/ ctx[0].beats} beats`) + "";

    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			label.textContent = "Break lines:";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			span = element("span");
    			t3 = text("Every ");
    			t4 = text(t4_value);
    			attr_dev(label, "class", "slider-label");
    			attr_dev(label, "for", "beats-for-newline");
    			add_location(label, file$6, 75, 12, 2452);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "id", "beats-for-newline");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "max", "32");
    			add_location(input, file$6, 76, 12, 2538);
    			add_location(span, file$6, 77, 12, 2635);
    			attr_dev(div, "class", "beats");
    			add_location(div, file$6, 74, 8, 2420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*settings*/ ctx[0].beats);
    			append_dev(div, t2);
    			append_dev(div, span);
    			append_dev(span, t3);
    			append_dev(span, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[7]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*settings*/ 1) {
    				set_input_value(input, /*settings*/ ctx[0].beats);
    			}

    			if (dirty & /*settings*/ 1 && t4_value !== (t4_value = (/*settings*/ ctx[0].beats == 1
    			? "1 beat"
    			: `${/*settings*/ ctx[0].beats} beats`) + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(74:4) {#if hasMIDI}",
    		ctx
    	});

    	return block;
    }

    // (84:4) {#if settings.missingTempo == true}
    function create_if_block_5$1(ctx) {
    	let div;
    	let label;
    	let t1;
    	let input0;
    	let t2;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			label.textContent = "BPM (?):";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			attr_dev(label, "class", "slider-label");
    			attr_dev(label, "for", "tempo");
    			attr_dev(label, "title", "You're able to change this because your MIDI file doesn't have tempo/BPM.");
    			add_location(label, file$6, 85, 12, 2923);
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "id", "tempo");
    			attr_dev(input0, "min", "1");
    			attr_dev(input0, "max", "300");
    			add_location(input0, file$6, 88, 12, 3112);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "w-16 box-border");
    			attr_dev(input1, "min", "1");
    			attr_dev(input1, "max", "300");
    			add_location(input1, file$6, 89, 12, 3196);
    			attr_dev(div, "class", "tempo");
    			add_location(div, file$6, 84, 8, 2891);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t1);
    			append_dev(div, input0);
    			set_input_value(input0, /*settings*/ ctx[0].bpm);
    			append_dev(div, t2);
    			append_dev(div, input1);
    			set_input_value(input1, /*settings*/ ctx[0].bpm);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_input_handler_1*/ ctx[8]),
    					listen_dev(input0, "input", /*input0_change_input_handler_1*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*settings*/ 1) {
    				set_input_value(input0, /*settings*/ ctx[0].bpm);
    			}

    			if (dirty & /*settings*/ 1 && to_number(input1.value) !== /*settings*/ ctx[0].bpm) {
    				set_input_value(input1, /*settings*/ ctx[0].bpm);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(84:4) {#if settings.missingTempo == true}",
    		ctx
    	});

    	return block;
    }

    // (94:4) {#if hasMIDI}
    function create_if_block_4$1(ctx) {
    	let div;
    	let label;
    	let t1;
    	let input;
    	let t2;
    	let span;
    	let t3_value = /*settings*/ ctx[0].quantize + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			label.textContent = "Quantize:";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = text(" miliseconds");
    			attr_dev(label, "class", "slider-label");
    			attr_dev(label, "for", "quantize-prompt");
    			add_location(label, file$6, 95, 12, 3366);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "id", "quantize-prompt");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "max", "250");
    			add_location(input, file$6, 96, 12, 3447);
    			add_location(span, file$6, 97, 12, 3546);
    			attr_dev(div, "class", "beats");
    			add_location(div, file$6, 94, 8, 3334);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*settings*/ ctx[0].quantize);
    			append_dev(div, t2);
    			append_dev(div, span);
    			append_dev(span, t3);
    			append_dev(span, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_input_handler_1*/ ctx[10]),
    					listen_dev(input, "input", /*input_change_input_handler_1*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*settings*/ 1) {
    				set_input_value(input, /*settings*/ ctx[0].quantize);
    			}

    			if (dirty & /*settings*/ 1 && t3_value !== (t3_value = /*settings*/ ctx[0].quantize + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(94:4) {#if hasMIDI}",
    		ctx
    	});

    	return block;
    }

    // (135:4) {#if hasMIDI}
    function create_if_block_2$2(ctx) {
    	let label;
    	let input;
    	let t0;
    	let t1;
    	let div;
    	let mounted;
    	let dispose;
    	let if_block = /*settings*/ ctx[0].bpmChanges && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = text("\n            Show BPM changes as comments");
    			t1 = space();
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", "bpm-changes");
    			add_location(input, file$6, 136, 12, 4772);
    			attr_dev(label, "for", "bpm-changes");
    			add_location(label, file$6, 135, 8, 4734);
    			attr_dev(div, "class", "beats");
    			add_location(div, file$6, 139, 8, 4914);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = /*settings*/ ctx[0].bpmChanges;
    			append_dev(label, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[17]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*settings*/ 1) {
    				input.checked = /*settings*/ ctx[0].bpmChanges;
    			}

    			if (/*settings*/ ctx[0].bpmChanges) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(135:4) {#if hasMIDI}",
    		ctx
    	});

    	return block;
    }

    // (141:12) {#if settings.bpmChanges}
    function create_if_block_3$1(ctx) {
    	let label;
    	let t1;
    	let input;
    	let t2;
    	let span;
    	let t3;
    	let t4_value = /*settings*/ ctx[0].minSpeedChange + "";
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			label.textContent = "Min. % speed change:";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			span = element("span");
    			t3 = text("At least ");
    			t4 = text(t4_value);
    			t5 = text("%");
    			attr_dev(label, "class", "slider-label");
    			attr_dev(label, "for", "min-speed-change");
    			add_location(label, file$6, 141, 16, 4989);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "id", "min-speed-change");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "100");
    			add_location(input, file$6, 142, 16, 5086);
    			add_location(span, file$6, 143, 16, 5196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*settings*/ ctx[0].minSpeedChange);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t3);
    			append_dev(span, t4);
    			append_dev(span, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_input_handler_2*/ ctx[18]),
    					listen_dev(input, "input", /*input_change_input_handler_2*/ ctx[18])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*settings*/ 1) {
    				set_input_value(input, /*settings*/ ctx[0].minSpeedChange);
    			}

    			if (dirty & /*settings*/ 1 && t4_value !== (t4_value = /*settings*/ ctx[0].minSpeedChange + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(141:12) {#if settings.bpmChanges}",
    		ctx
    	});

    	return block;
    }

    // (149:4) {#if settings.oors && settings.oorMarks}
    function create_if_block_1$2(ctx) {
    	let div1;
    	let label;
    	let t1;
    	let div0;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			label = element("label");
    			label.textContent = "Out-of-range separator (?):";
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			attr_dev(label, "title", "Helps tell you if notes are out-of-range, certain characters are restricted from use!");
    			attr_dev(label, "for", "oor-separator");
    			add_location(label, file$6, 150, 8, 5352);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "oor-separator");
    			add_location(input, file$6, 152, 12, 5564);
    			set_style(div0, "display", "inline-flex");
    			add_location(div0, file$6, 151, 8, 5517);
    			add_location(div1, file$6, 149, 4, 5338);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*settings*/ ctx[0].oorSeparator);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[19]),
    					listen_dev(input, "input", /*input_handler*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*settings*/ 1 && input.value !== /*settings*/ ctx[0].oorSeparator) {
    				set_input_value(input, /*settings*/ ctx[0].oorSeparator);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(149:4) {#if settings.oors && settings.oorMarks}",
    		ctx
    	});

    	return block;
    }

    // (176:12) {#each fonts as font}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*font*/ ctx[24] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*font*/ ctx[24];
    			option.value = option.__value;
    			add_location(option, file$6, 176, 16, 6429);
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
    		source: "(176:12) {#each fonts as font}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SheetOptions', slots, []);
    	let dispatch = createEventDispatcher();
    	let { show } = $$props;
    	let { hasMIDI = false } = $$props;

    	let fonts = [
    		'Verdana',
    		'Tahoma',
    		'Dejavu Sans',
    		'Segoe UI',
    		'Helvetica',
    		'Lucida Console',
    		'Candara'
    	];

    	let { settings = {
    		beats: 4,
    		quantize: 35,
    		classicChordOrder: true,
    		sequentialQuantize: true,
    		curlyQuantizes: true,
    		pShifts: 'Start',
    		pOors: 'Inorder',
    		oors: true,
    		tempoMarks: false,
    		oorMarks: false,
    		bpmChanges: true,
    		minSpeedChange: 10,
    		oorSeparator: ':',
    		resilience: 2,
    		font: fonts[0],
    		lineHeight: 135,
    		capturingImage: false,
    		missingTempo: false,
    		bpm: 120
    	} } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (show === undefined && !('show' in $$props || $$self.$$.bound[$$self.$$.props['show']])) {
    			console.warn("<SheetOptions> was created without expected prop 'show'");
    		}
    	});

    	const writable_props = ['show', 'hasMIDI', 'settings'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SheetOptions> was created with unknown prop '${key}'`);
    	});

    	function input0_change_input_handler() {
    		settings.resilience = to_number(this.value);
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

    	function input_change_input_handler() {
    		settings.beats = to_number(this.value);
    		$$invalidate(0, settings);
    	}

    	function input0_change_input_handler_1() {
    		settings.bpm = to_number(this.value);
    		$$invalidate(0, settings);
    	}

    	function input1_input_handler() {
    		settings.bpm = to_number(this.value);
    		$$invalidate(0, settings);
    	}

    	function input_change_input_handler_1() {
    		settings.quantize = to_number(this.value);
    		$$invalidate(0, settings);
    	}

    	function input1_change_handler() {
    		settings.classicChordOrder = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input2_change_handler() {
    		settings.sequentialQuantize = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input3_change_handler() {
    		settings.curlyQuantizes = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input4_change_handler() {
    		settings.oors = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input5_change_handler() {
    		settings.tempoMarks = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input6_change_handler() {
    		settings.oorMarks = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input_change_handler() {
    		settings.bpmChanges = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input_change_input_handler_2() {
    		settings.minSpeedChange = to_number(this.value);
    		$$invalidate(0, settings);
    	}

    	function input_input_handler() {
    		settings.oorSeparator = this.value;
    		$$invalidate(0, settings);
    	}

    	const input_handler = val => {
    		if ([
    			null,
    			"0",
    			"",
    			"    ",
    			" ",
    			"'",
    			"[",
    			"]",
    			"(",
    			")",
    			"{",
    			"}",
    			"_",
    			"-",
    			".",
    			","
    		].concat(vpScale.split('')).includes(val.data?.toLowerCase() ?? null)) {
    			// if restricted char, reset to default
    			$$invalidate(0, settings.oorSeparator = ":", settings);
    		} else $$invalidate(0, settings.oorSeparator = val.data[0], settings);
    	};

    	function select2_change_handler() {
    		settings.font = select_value(this);
    		$$invalidate(0, settings);
    	}

    	function input7_change_input_handler() {
    		settings.lineHeight = to_number(this.value);
    		$$invalidate(0, settings);
    	}

    	$$self.$$set = $$props => {
    		if ('show' in $$props) $$invalidate(1, show = $$props.show);
    		if ('hasMIDI' in $$props) $$invalidate(2, hasMIDI = $$props.hasMIDI);
    		if ('settings' in $$props) $$invalidate(0, settings = $$props.settings);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		vpScale,
    		dispatch,
    		show,
    		hasMIDI,
    		fonts,
    		settings
    	});

    	$$self.$inject_state = $$props => {
    		if ('dispatch' in $$props) dispatch = $$props.dispatch;
    		if ('show' in $$props) $$invalidate(1, show = $$props.show);
    		if ('hasMIDI' in $$props) $$invalidate(2, hasMIDI = $$props.hasMIDI);
    		if ('fonts' in $$props) $$invalidate(3, fonts = $$props.fonts);
    		if ('settings' in $$props) $$invalidate(0, settings = $$props.settings);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		settings,
    		show,
    		hasMIDI,
    		fonts,
    		input0_change_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		input_change_input_handler,
    		input0_change_input_handler_1,
    		input1_input_handler,
    		input_change_input_handler_1,
    		input1_change_handler,
    		input2_change_handler,
    		input3_change_handler,
    		input4_change_handler,
    		input5_change_handler,
    		input6_change_handler,
    		input_change_handler,
    		input_change_input_handler_2,
    		input_input_handler,
    		input_handler,
    		select2_change_handler,
    		input7_change_input_handler
    	];
    }

    class SheetOptions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { show: 1, hasMIDI: 2, settings: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetOptions",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get show() {
    		throw new Error("<SheetOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<SheetOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasMIDI() {
    		throw new Error("<SheetOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasMIDI(value) {
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

    const file$5 = "src\\components\\Track.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let input;
    	let input_id_value;
    	let t0;
    	let label;
    	let t1;
    	let t2;
    	let t3;
    	let t4_value = /*track*/ ctx[1].getTrackLength() + "";
    	let t4;
    	let t5;
    	let label_for_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text("Track ");
    			t2 = text(/*idx*/ ctx[2]);
    			t3 = text(" (");
    			t4 = text(t4_value);
    			t5 = text(" events)");
    			attr_dev(input, "id", input_id_value = "trackbox" + /*idx*/ ctx[2]);
    			attr_dev(input, "type", "checkbox");
    			set_style(input, "transform", "scale(1.5)");
    			add_location(input, file$5, 6, 4, 136);
    			attr_dev(label, "for", label_for_value = "trackbox" + /*idx*/ ctx[2]);
    			attr_dev(label, "class", "mx-2");
    			add_location(label, file$5, 7, 4, 237);
    			attr_dev(div, "id", "track");
    			attr_dev(div, "class", "flex flex-row align-middle");
    			add_location(div, file$5, 5, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			input.checked = /*selected*/ ctx[0];
    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, t1);
    			append_dev(label, t2);
    			append_dev(label, t3);
    			append_dev(label, t4);
    			append_dev(label, t5);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*idx*/ 4 && input_id_value !== (input_id_value = "trackbox" + /*idx*/ ctx[2])) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*selected*/ 1) {
    				input.checked = /*selected*/ ctx[0];
    			}

    			if (dirty & /*idx*/ 4) set_data_dev(t2, /*idx*/ ctx[2]);
    			if (dirty & /*track*/ 2 && t4_value !== (t4_value = /*track*/ ctx[1].getTrackLength() + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*idx*/ 4 && label_for_value !== (label_for_value = "trackbox" + /*idx*/ ctx[2])) {
    				attr_dev(label, "for", label_for_value);
    			}
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { track: 1, idx: 2, selected: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Track",
    			options,
    			id: create_fragment$5.name
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

    function color_for_chord(beat, difference) {
        // let beat = curr_note.tempo / 1000;

        // let difference = next_note.playTime - curr_note.playTime;
        difference -= 0.5;

        // console.log(chord.notes[0], next.notes[0])

        let color = colors.long;

        if (difference < beat / 16) color = colors.sixtyfourth;
        else if (difference < beat / 8) color = colors.thirtysecond;
        else if (difference < beat / 4) color = colors.sixteenth;
        else if (difference < beat / 2) color = colors.eighth;
        else if (difference < beat) color = colors.quarter;
        else if (difference < beat * 2)
            // Or equal to a beat
            color = colors.half;
        else if (difference < beat * 4) color = colors.whole;
        else if (difference < beat * 8) color = colors.quadruple;
        else if (difference < beat * 16) color = colors.long;

        return color;
    }

    // These two are deprecated
    // function yellow_to_green(value) {
    //     value = Math.max(0.0, Math.min(4.0, value))
    //     const red = 255 - (255/4.0)*value
    //     const green = 255
    //     return `rgb(${red}, ${green}, 0)`
    // }

    // function yellow_to_red(value) {
    //     value = Math.max(0.0, Math.min(4.0, value))
    //     const red = 255
    //     const green = 255 - (255/4.0)*value 
    //     return `rgb(${red}, ${green}, 0)`
    // }

    function colored_string(s, color, options = {}) {
        return `<span style="color:${color};${options.underline ? `border-bottom:2px solid ${color}` : ''}">${s}</span>`
    }

    function render_chord(chord, next, settings, selected) {
        const selection_color = "rgba(97, 97, 97, 50)";

        let color;

        let curr_note = chord?.notes?.[0];
        let next_note = next?.notes?.[0];
        if (!curr_note) return "";
        
        let beat = 0, difference = 0;

        if (!next_note) {
            color = colors.long;
        } else {
            beat = curr_note.tempo / 1000;
            difference = next_note?.playTime - curr_note.playTime - 0.5;
            color = color_for_chord(beat, difference);
        }

        let res = `<span style="color:${color}; ${selected ? "background-color: " + selection_color + ";" : ""}">`;

        let isChord = chord.notes.length > 1 && chord.notes.find((note) => note.valid === true);

        if (settings.oors === false)
            if (chord.notes.filter(note => note.outOfRange === false).length <= 1)
                isChord = false;

        if (isChord) {
            if (chord.is_quantized && settings.curlyQuantizes === true) {
                res += "{";
            } else
                res += "[";
        }

        for (const note of chord.notes) {
            if (!note.valid) {
                res += "_";
                continue;
            }

            let draw_as_oor = (note.outOfRange === true && settings.oors === true);
            
            if (draw_as_oor === true) {
                let nonOors = chord.notes.filter(note => note.outOfRange === false);
                let startOors = chord.notes.filter(note => note.outOfRange === true && note.displayValue === note.value - 1024);
                let endOors = chord.notes.filter(note => note.outOfRange === true && note.displayValue === note.value + 1024);
            
                const isFirstStartOor = (note === startOors[0]);
                const isLastStartOor = (note === startOors[startOors.length-1]);
                const isFirstEndOorWithoutChord = !isChord && note === endOors[0];
                const isChordWithOnlyEndOorsAndIsFirstEndOor = isChord && nonOors.length === 0 && startOors.length === 0 && note === endOors[0];
                const isChordWithMoreThanOneNonOorAndIsFirstEndOor = isChord && nonOors.length > 0 && note === endOors[0];

                if (
                    isFirstStartOor ||
                    isFirstEndOorWithoutChord ||
                    isChordWithOnlyEndOorsAndIsFirstEndOor ||
                    isChordWithMoreThanOneNonOorAndIsFirstEndOor
                ) {
                    
                    let inner = settings.oorMarks ? (settings.oorSeparator + note.char) : note.char;
                    res += `<span style="display:inline-flex; justify-content: center; min-width: 0.6em; border-bottom: 2px solid; font-weight: 900">`
                            + `${inner}</span>`;
                }
                
                if (settings.oorMarks)
                    if (isLastStartOor && nonOors.length > 0)
                        res += `'`;
            
            } else if (!draw_as_oor && !note.outOfRange) {
                res += note.char;
            }
        } // end note loop

        if (isChord) {
            if (chord.is_quantized && settings.curlyQuantizes === true) {
                res += "}";
            } else
                res += "]";
        }

        // Separator
        res += settings.tempoMarks ? 
            colored_string(separator(beat ?? undefined, difference), color)
            : ' ';
        return res + "</span>";
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z$1 = ".chord-block.svelte-1l3km4k{position:relative\n        /* padding: 20px;\n        margin: -20px; */\n    }.chord-block.svelte-1l3km4k::before{content:'';position:absolute;height:126%;width:100%}.chord-block.svelte-1l3km4k:hover{background-color:#3d3a42;cursor:pointer}";
    styleInject(css_248z$1);

    /* src\components\Chord.svelte generated by Svelte v3.55.1 */
    const file$4 = "src\\components\\Chord.svelte";

    function create_fragment$4(ctx) {
    	let span;
    	let raw_value = render_chord(/*chord*/ ctx[1], /*next*/ ctx[2], /*settings*/ ctx[4], /*selected*/ ctx[3]) + "";
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "chord-block svelte-1l3km4k");
    			add_location(span, file$4, 17, 0, 417);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "contextmenu", prevent_default(/*contextmenu_handler*/ ctx[6]), false, true, false),
    					listen_dev(span, "mousedown", stop_propagation(/*mousedown_handler*/ ctx[7]), false, false, true)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*chord, next, settings, selected*/ 30 && raw_value !== (raw_value = render_chord(/*chord*/ ctx[1], /*next*/ ctx[2], /*settings*/ ctx[4], /*selected*/ ctx[3]) + "")) span.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Chord', slots, []);
    	const dispatch = createEventDispatcher();
    	let { index } = $$props;
    	let { chord } = $$props;
    	let { next } = $$props;
    	let { selected } = $$props;
    	let { settings } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console.warn("<Chord> was created without expected prop 'index'");
    		}

    		if (chord === undefined && !('chord' in $$props || $$self.$$.bound[$$self.$$.props['chord']])) {
    			console.warn("<Chord> was created without expected prop 'chord'");
    		}

    		if (next === undefined && !('next' in $$props || $$self.$$.bound[$$self.$$.props['next']])) {
    			console.warn("<Chord> was created without expected prop 'next'");
    		}

    		if (selected === undefined && !('selected' in $$props || $$self.$$.bound[$$self.$$.props['selected']])) {
    			console.warn("<Chord> was created without expected prop 'selected'");
    		}

    		if (settings === undefined && !('settings' in $$props || $$self.$$.bound[$$self.$$.props['settings']])) {
    			console.warn("<Chord> was created without expected prop 'settings'");
    		}
    	});

    	const writable_props = ['index', 'chord', 'next', 'selected', 'settings'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Chord> was created with unknown prop '${key}'`);
    	});

    	function contextmenu_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const mousedown_handler = e => {
    		switch (e.button) {
    			case 0:
    				// Left mouse button
    				dispatch("select", { index: +index, by: -1 });
    				break;
    			case 1:
    				// Middle mouse button
    				e.preventDefault();
    				break;
    			case 2:
    				// Right mouse button
    				dispatch("select", { index: +index, by: 1 });
    				e.preventDefault();
    				break;
    		}
    	};

    	$$self.$$set = $$props => {
    		if ('index' in $$props) $$invalidate(0, index = $$props.index);
    		if ('chord' in $$props) $$invalidate(1, chord = $$props.chord);
    		if ('next' in $$props) $$invalidate(2, next = $$props.next);
    		if ('selected' in $$props) $$invalidate(3, selected = $$props.selected);
    		if ('settings' in $$props) $$invalidate(4, settings = $$props.settings);
    	};

    	$$self.$capture_state = () => ({
    		colors,
    		color_for_chord,
    		colored_string,
    		render_chord,
    		createEventDispatcher,
    		dispatch,
    		index,
    		chord,
    		next,
    		selected,
    		settings
    	});

    	$$self.$inject_state = $$props => {
    		if ('index' in $$props) $$invalidate(0, index = $$props.index);
    		if ('chord' in $$props) $$invalidate(1, chord = $$props.chord);
    		if ('next' in $$props) $$invalidate(2, next = $$props.next);
    		if ('selected' in $$props) $$invalidate(3, selected = $$props.selected);
    		if ('settings' in $$props) $$invalidate(4, settings = $$props.settings);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		index,
    		chord,
    		next,
    		selected,
    		settings,
    		dispatch,
    		contextmenu_handler,
    		mousedown_handler
    	];
    }

    class Chord extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			index: 0,
    			chord: 1,
    			next: 2,
    			selected: 3,
    			settings: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chord",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get index() {
    		throw new Error("<Chord>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Chord>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get chord() {
    		throw new Error("<Chord>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chord(value) {
    		throw new Error("<Chord>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		throw new Error("<Chord>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<Chord>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Chord>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Chord>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get settings() {
    		throw new Error("<Chord>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings(value) {
    		throw new Error("<Chord>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
    // (C) 1995-2013 Jean-loup Gailly and Mark Adler
    // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
    //
    // This software is provided 'as-is', without any express or implied
    // warranty. In no event will the authors be held liable for any damages
    // arising from the use of this software.
    //
    // Permission is granted to anyone to use this software for any purpose,
    // including commercial applications, and to alter it and redistribute it
    // freely, subject to the following restrictions:
    //
    // 1. The origin of this software must not be misrepresented; you must not
    //   claim that you wrote the original software. If you use this software
    //   in a product, an acknowledgment in the product documentation would be
    //   appreciated but is not required.
    // 2. Altered source versions must be plainly marked as such, and must not be
    //   misrepresented as being the original software.
    // 3. This notice may not be removed or altered from any source distribution.

    /* eslint-disable space-unary-ops */

    /* Public constants ==========================================================*/
    /* ===========================================================================*/


    //const Z_FILTERED          = 1;
    //const Z_HUFFMAN_ONLY      = 2;
    //const Z_RLE               = 3;
    const Z_FIXED$1               = 4;
    //const Z_DEFAULT_STRATEGY  = 0;

    /* Possible values of the data_type field (though see inflate()) */
    const Z_BINARY              = 0;
    const Z_TEXT                = 1;
    //const Z_ASCII             = 1; // = Z_TEXT
    const Z_UNKNOWN$1             = 2;

    /*============================================================================*/


    function zero$1(buf) { let len = buf.length; while (--len >= 0) { buf[len] = 0; } }

    // From zutil.h

    const STORED_BLOCK = 0;
    const STATIC_TREES = 1;
    const DYN_TREES    = 2;
    /* The three kinds of block type */

    const MIN_MATCH$1    = 3;
    const MAX_MATCH$1    = 258;
    /* The minimum and maximum match lengths */

    // From deflate.h
    /* ===========================================================================
     * Internal compression state.
     */

    const LENGTH_CODES$1  = 29;
    /* number of length codes, not counting the special END_BLOCK code */

    const LITERALS$1      = 256;
    /* number of literal bytes 0..255 */

    const L_CODES$1       = LITERALS$1 + 1 + LENGTH_CODES$1;
    /* number of Literal or Length codes, including the END_BLOCK code */

    const D_CODES$1       = 30;
    /* number of distance codes */

    const BL_CODES$1      = 19;
    /* number of codes used to transfer the bit lengths */

    const HEAP_SIZE$1     = 2 * L_CODES$1 + 1;
    /* maximum heap size */

    const MAX_BITS$1      = 15;
    /* All codes must not exceed MAX_BITS bits */

    const Buf_size      = 16;
    /* size of bit buffer in bi_buf */


    /* ===========================================================================
     * Constants
     */

    const MAX_BL_BITS = 7;
    /* Bit length codes must not exceed MAX_BL_BITS bits */

    const END_BLOCK   = 256;
    /* end of block literal code */

    const REP_3_6     = 16;
    /* repeat previous bit length 3-6 times (2 bits of repeat count) */

    const REPZ_3_10   = 17;
    /* repeat a zero length 3-10 times  (3 bits of repeat count) */

    const REPZ_11_138 = 18;
    /* repeat a zero length 11-138 times  (7 bits of repeat count) */

    /* eslint-disable comma-spacing,array-bracket-spacing */
    const extra_lbits =   /* extra bits for each length code */
      new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]);

    const extra_dbits =   /* extra bits for each distance code */
      new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]);

    const extra_blbits =  /* extra bits for each bit length code */
      new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]);

    const bl_order =
      new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);
    /* eslint-enable comma-spacing,array-bracket-spacing */

    /* The lengths of the bit length codes are sent in order of decreasing
     * probability, to avoid transmitting the lengths for unused bit length codes.
     */

    /* ===========================================================================
     * Local data. These are initialized only once.
     */

    // We pre-fill arrays with 0 to avoid uninitialized gaps

    const DIST_CODE_LEN = 512; /* see definition of array dist_code below */

    // !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
    const static_ltree  = new Array((L_CODES$1 + 2) * 2);
    zero$1(static_ltree);
    /* The static literal tree. Since the bit lengths are imposed, there is no
     * need for the L_CODES extra codes used during heap construction. However
     * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
     * below).
     */

    const static_dtree  = new Array(D_CODES$1 * 2);
    zero$1(static_dtree);
    /* The static distance tree. (Actually a trivial tree since all codes use
     * 5 bits.)
     */

    const _dist_code    = new Array(DIST_CODE_LEN);
    zero$1(_dist_code);
    /* Distance codes. The first 256 values correspond to the distances
     * 3 .. 258, the last 256 values correspond to the top 8 bits of
     * the 15 bit distances.
     */

    const _length_code  = new Array(MAX_MATCH$1 - MIN_MATCH$1 + 1);
    zero$1(_length_code);
    /* length code for each normalized match length (0 == MIN_MATCH) */

    const base_length   = new Array(LENGTH_CODES$1);
    zero$1(base_length);
    /* First normalized length for each code (0 = MIN_MATCH) */

    const base_dist     = new Array(D_CODES$1);
    zero$1(base_dist);
    /* First normalized distance for each code (0 = distance of 1) */


    function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

      this.static_tree  = static_tree;  /* static tree or NULL */
      this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
      this.extra_base   = extra_base;   /* base index for extra_bits */
      this.elems        = elems;        /* max number of elements in the tree */
      this.max_length   = max_length;   /* max bit length for the codes */

      // show if `static_tree` has data or dummy - needed for monomorphic objects
      this.has_stree    = static_tree && static_tree.length;
    }


    let static_l_desc;
    let static_d_desc;
    let static_bl_desc;


    function TreeDesc(dyn_tree, stat_desc) {
      this.dyn_tree = dyn_tree;     /* the dynamic tree */
      this.max_code = 0;            /* largest code with non zero frequency */
      this.stat_desc = stat_desc;   /* the corresponding static tree */
    }



    const d_code = (dist) => {

      return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
    };


    /* ===========================================================================
     * Output a short LSB first on the stream.
     * IN assertion: there is enough room in pendingBuf.
     */
    const put_short = (s, w) => {
    //    put_byte(s, (uch)((w) & 0xff));
    //    put_byte(s, (uch)((ush)(w) >> 8));
      s.pending_buf[s.pending++] = (w) & 0xff;
      s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
    };


    /* ===========================================================================
     * Send a value on a given number of bits.
     * IN assertion: length <= 16 and value fits in length bits.
     */
    const send_bits = (s, value, length) => {

      if (s.bi_valid > (Buf_size - length)) {
        s.bi_buf |= (value << s.bi_valid) & 0xffff;
        put_short(s, s.bi_buf);
        s.bi_buf = value >> (Buf_size - s.bi_valid);
        s.bi_valid += length - Buf_size;
      } else {
        s.bi_buf |= (value << s.bi_valid) & 0xffff;
        s.bi_valid += length;
      }
    };


    const send_code = (s, c, tree) => {

      send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
    };


    /* ===========================================================================
     * Reverse the first len bits of a code, using straightforward code (a faster
     * method would use a table)
     * IN assertion: 1 <= len <= 15
     */
    const bi_reverse = (code, len) => {

      let res = 0;
      do {
        res |= code & 1;
        code >>>= 1;
        res <<= 1;
      } while (--len > 0);
      return res >>> 1;
    };


    /* ===========================================================================
     * Flush the bit buffer, keeping at most 7 bits in it.
     */
    const bi_flush = (s) => {

      if (s.bi_valid === 16) {
        put_short(s, s.bi_buf);
        s.bi_buf = 0;
        s.bi_valid = 0;

      } else if (s.bi_valid >= 8) {
        s.pending_buf[s.pending++] = s.bi_buf & 0xff;
        s.bi_buf >>= 8;
        s.bi_valid -= 8;
      }
    };


    /* ===========================================================================
     * Compute the optimal bit lengths for a tree and update the total bit length
     * for the current block.
     * IN assertion: the fields freq and dad are set, heap[heap_max] and
     *    above are the tree nodes sorted by increasing frequency.
     * OUT assertions: the field len is set to the optimal bit length, the
     *     array bl_count contains the frequencies for each bit length.
     *     The length opt_len is updated; static_len is also updated if stree is
     *     not null.
     */
    const gen_bitlen = (s, desc) => {
    //    deflate_state *s;
    //    tree_desc *desc;    /* the tree descriptor */

      const tree            = desc.dyn_tree;
      const max_code        = desc.max_code;
      const stree           = desc.stat_desc.static_tree;
      const has_stree       = desc.stat_desc.has_stree;
      const extra           = desc.stat_desc.extra_bits;
      const base            = desc.stat_desc.extra_base;
      const max_length      = desc.stat_desc.max_length;
      let h;              /* heap index */
      let n, m;           /* iterate over the tree elements */
      let bits;           /* bit length */
      let xbits;          /* extra bits */
      let f;              /* frequency */
      let overflow = 0;   /* number of elements with bit length too large */

      for (bits = 0; bits <= MAX_BITS$1; bits++) {
        s.bl_count[bits] = 0;
      }

      /* In a first pass, compute the optimal bit lengths (which may
       * overflow in the case of the bit length tree).
       */
      tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

      for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
        n = s.heap[h];
        bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
        if (bits > max_length) {
          bits = max_length;
          overflow++;
        }
        tree[n * 2 + 1]/*.Len*/ = bits;
        /* We overwrite tree[n].Dad which is no longer needed */

        if (n > max_code) { continue; } /* not a leaf node */

        s.bl_count[bits]++;
        xbits = 0;
        if (n >= base) {
          xbits = extra[n - base];
        }
        f = tree[n * 2]/*.Freq*/;
        s.opt_len += f * (bits + xbits);
        if (has_stree) {
          s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
        }
      }
      if (overflow === 0) { return; }

      // Tracev((stderr,"\nbit length overflow\n"));
      /* This happens for example on obj2 and pic of the Calgary corpus */

      /* Find the first bit length which could increase: */
      do {
        bits = max_length - 1;
        while (s.bl_count[bits] === 0) { bits--; }
        s.bl_count[bits]--;      /* move one leaf down the tree */
        s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
        s.bl_count[max_length]--;
        /* The brother of the overflow item also moves one step up,
         * but this does not affect bl_count[max_length]
         */
        overflow -= 2;
      } while (overflow > 0);

      /* Now recompute all bit lengths, scanning in increasing frequency.
       * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
       * lengths instead of fixing only the wrong ones. This idea is taken
       * from 'ar' written by Haruhiko Okumura.)
       */
      for (bits = max_length; bits !== 0; bits--) {
        n = s.bl_count[bits];
        while (n !== 0) {
          m = s.heap[--h];
          if (m > max_code) { continue; }
          if (tree[m * 2 + 1]/*.Len*/ !== bits) {
            // Tracev((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
            s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
            tree[m * 2 + 1]/*.Len*/ = bits;
          }
          n--;
        }
      }
    };


    /* ===========================================================================
     * Generate the codes for a given tree and bit counts (which need not be
     * optimal).
     * IN assertion: the array bl_count contains the bit length statistics for
     * the given tree and the field len is set for all tree elements.
     * OUT assertion: the field code is set for all tree elements of non
     *     zero code length.
     */
    const gen_codes = (tree, max_code, bl_count) => {
    //    ct_data *tree;             /* the tree to decorate */
    //    int max_code;              /* largest code with non zero frequency */
    //    ushf *bl_count;            /* number of codes at each bit length */

      const next_code = new Array(MAX_BITS$1 + 1); /* next code value for each bit length */
      let code = 0;              /* running code value */
      let bits;                  /* bit index */
      let n;                     /* code index */

      /* The distribution counts are first used to generate the code values
       * without bit reversal.
       */
      for (bits = 1; bits <= MAX_BITS$1; bits++) {
        code = (code + bl_count[bits - 1]) << 1;
        next_code[bits] = code;
      }
      /* Check that the bit counts in bl_count are consistent. The last code
       * must be all ones.
       */
      //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
      //        "inconsistent bit counts");
      //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

      for (n = 0;  n <= max_code; n++) {
        let len = tree[n * 2 + 1]/*.Len*/;
        if (len === 0) { continue; }
        /* Now reverse the bits */
        tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

        //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
        //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
      }
    };


    /* ===========================================================================
     * Initialize the various 'constant' tables.
     */
    const tr_static_init = () => {

      let n;        /* iterates over tree elements */
      let bits;     /* bit counter */
      let length;   /* length value */
      let code;     /* code value */
      let dist;     /* distance index */
      const bl_count = new Array(MAX_BITS$1 + 1);
      /* number of codes at each bit length for an optimal tree */

      // do check in _tr_init()
      //if (static_init_done) return;

      /* For some embedded targets, global variables are not initialized: */
    /*#ifdef NO_INIT_GLOBAL_POINTERS
      static_l_desc.static_tree = static_ltree;
      static_l_desc.extra_bits = extra_lbits;
      static_d_desc.static_tree = static_dtree;
      static_d_desc.extra_bits = extra_dbits;
      static_bl_desc.extra_bits = extra_blbits;
    #endif*/

      /* Initialize the mapping length (0..255) -> length code (0..28) */
      length = 0;
      for (code = 0; code < LENGTH_CODES$1 - 1; code++) {
        base_length[code] = length;
        for (n = 0; n < (1 << extra_lbits[code]); n++) {
          _length_code[length++] = code;
        }
      }
      //Assert (length == 256, "tr_static_init: length != 256");
      /* Note that the length 255 (match length 258) can be represented
       * in two different ways: code 284 + 5 bits or code 285, so we
       * overwrite length_code[255] to use the best encoding:
       */
      _length_code[length - 1] = code;

      /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
      dist = 0;
      for (code = 0; code < 16; code++) {
        base_dist[code] = dist;
        for (n = 0; n < (1 << extra_dbits[code]); n++) {
          _dist_code[dist++] = code;
        }
      }
      //Assert (dist == 256, "tr_static_init: dist != 256");
      dist >>= 7; /* from now on, all distances are divided by 128 */
      for (; code < D_CODES$1; code++) {
        base_dist[code] = dist << 7;
        for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
          _dist_code[256 + dist++] = code;
        }
      }
      //Assert (dist == 256, "tr_static_init: 256+dist != 512");

      /* Construct the codes of the static literal tree */
      for (bits = 0; bits <= MAX_BITS$1; bits++) {
        bl_count[bits] = 0;
      }

      n = 0;
      while (n <= 143) {
        static_ltree[n * 2 + 1]/*.Len*/ = 8;
        n++;
        bl_count[8]++;
      }
      while (n <= 255) {
        static_ltree[n * 2 + 1]/*.Len*/ = 9;
        n++;
        bl_count[9]++;
      }
      while (n <= 279) {
        static_ltree[n * 2 + 1]/*.Len*/ = 7;
        n++;
        bl_count[7]++;
      }
      while (n <= 287) {
        static_ltree[n * 2 + 1]/*.Len*/ = 8;
        n++;
        bl_count[8]++;
      }
      /* Codes 286 and 287 do not exist, but we must include them in the
       * tree construction to get a canonical Huffman tree (longest code
       * all ones)
       */
      gen_codes(static_ltree, L_CODES$1 + 1, bl_count);

      /* The static distance tree is trivial: */
      for (n = 0; n < D_CODES$1; n++) {
        static_dtree[n * 2 + 1]/*.Len*/ = 5;
        static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
      }

      // Now data ready and we can init static trees
      static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS$1 + 1, L_CODES$1, MAX_BITS$1);
      static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES$1, MAX_BITS$1);
      static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES$1, MAX_BL_BITS);

      //static_init_done = true;
    };


    /* ===========================================================================
     * Initialize a new block.
     */
    const init_block = (s) => {

      let n; /* iterates over tree elements */

      /* Initialize the trees. */
      for (n = 0; n < L_CODES$1;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
      for (n = 0; n < D_CODES$1;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
      for (n = 0; n < BL_CODES$1; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

      s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
      s.opt_len = s.static_len = 0;
      s.sym_next = s.matches = 0;
    };


    /* ===========================================================================
     * Flush the bit buffer and align the output on a byte boundary
     */
    const bi_windup = (s) =>
    {
      if (s.bi_valid > 8) {
        put_short(s, s.bi_buf);
      } else if (s.bi_valid > 0) {
        //put_byte(s, (Byte)s->bi_buf);
        s.pending_buf[s.pending++] = s.bi_buf;
      }
      s.bi_buf = 0;
      s.bi_valid = 0;
    };

    /* ===========================================================================
     * Compares to subtrees, using the tree depth as tie breaker when
     * the subtrees have equal frequency. This minimizes the worst case length.
     */
    const smaller = (tree, n, m, depth) => {

      const _n2 = n * 2;
      const _m2 = m * 2;
      return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
             (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
    };

    /* ===========================================================================
     * Restore the heap property by moving down the tree starting at node k,
     * exchanging a node with the smallest of its two sons if necessary, stopping
     * when the heap property is re-established (each father smaller than its
     * two sons).
     */
    const pqdownheap = (s, tree, k) => {
    //    deflate_state *s;
    //    ct_data *tree;  /* the tree to restore */
    //    int k;               /* node to move down */

      const v = s.heap[k];
      let j = k << 1;  /* left son of k */
      while (j <= s.heap_len) {
        /* Set j to the smallest of the two sons: */
        if (j < s.heap_len &&
          smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
          j++;
        }
        /* Exit if v is smaller than both sons */
        if (smaller(tree, v, s.heap[j], s.depth)) { break; }

        /* Exchange v with the smallest son */
        s.heap[k] = s.heap[j];
        k = j;

        /* And continue down the tree, setting j to the left son of k */
        j <<= 1;
      }
      s.heap[k] = v;
    };


    // inlined manually
    // const SMALLEST = 1;

    /* ===========================================================================
     * Send the block data compressed using the given Huffman trees
     */
    const compress_block = (s, ltree, dtree) => {
    //    deflate_state *s;
    //    const ct_data *ltree; /* literal tree */
    //    const ct_data *dtree; /* distance tree */

      let dist;           /* distance of matched string */
      let lc;             /* match length or unmatched char (if dist == 0) */
      let sx = 0;         /* running index in sym_buf */
      let code;           /* the code to send */
      let extra;          /* number of extra bits to send */

      if (s.sym_next !== 0) {
        do {
          dist = s.pending_buf[s.sym_buf + sx++] & 0xff;
          dist += (s.pending_buf[s.sym_buf + sx++] & 0xff) << 8;
          lc = s.pending_buf[s.sym_buf + sx++];
          if (dist === 0) {
            send_code(s, lc, ltree); /* send a literal byte */
            //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
          } else {
            /* Here, lc is the match length - MIN_MATCH */
            code = _length_code[lc];
            send_code(s, code + LITERALS$1 + 1, ltree); /* send the length code */
            extra = extra_lbits[code];
            if (extra !== 0) {
              lc -= base_length[code];
              send_bits(s, lc, extra);       /* send the extra length bits */
            }
            dist--; /* dist is now the match distance - 1 */
            code = d_code(dist);
            //Assert (code < D_CODES, "bad d_code");

            send_code(s, code, dtree);       /* send the distance code */
            extra = extra_dbits[code];
            if (extra !== 0) {
              dist -= base_dist[code];
              send_bits(s, dist, extra);   /* send the extra distance bits */
            }
          } /* literal or match pair ? */

          /* Check that the overlay between pending_buf and sym_buf is ok: */
          //Assert(s->pending < s->lit_bufsize + sx, "pendingBuf overflow");

        } while (sx < s.sym_next);
      }

      send_code(s, END_BLOCK, ltree);
    };


    /* ===========================================================================
     * Construct one Huffman tree and assigns the code bit strings and lengths.
     * Update the total bit length for the current block.
     * IN assertion: the field freq is set for all tree elements.
     * OUT assertions: the fields len and code are set to the optimal bit length
     *     and corresponding code. The length opt_len is updated; static_len is
     *     also updated if stree is not null. The field max_code is set.
     */
    const build_tree = (s, desc) => {
    //    deflate_state *s;
    //    tree_desc *desc; /* the tree descriptor */

      const tree     = desc.dyn_tree;
      const stree    = desc.stat_desc.static_tree;
      const has_stree = desc.stat_desc.has_stree;
      const elems    = desc.stat_desc.elems;
      let n, m;          /* iterate over heap elements */
      let max_code = -1; /* largest code with non zero frequency */
      let node;          /* new node being created */

      /* Construct the initial heap, with least frequent element in
       * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
       * heap[0] is not used.
       */
      s.heap_len = 0;
      s.heap_max = HEAP_SIZE$1;

      for (n = 0; n < elems; n++) {
        if (tree[n * 2]/*.Freq*/ !== 0) {
          s.heap[++s.heap_len] = max_code = n;
          s.depth[n] = 0;

        } else {
          tree[n * 2 + 1]/*.Len*/ = 0;
        }
      }

      /* The pkzip format requires that at least one distance code exists,
       * and that at least one bit should be sent even if there is only one
       * possible code. So to avoid special checks later on we force at least
       * two codes of non zero frequency.
       */
      while (s.heap_len < 2) {
        node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
        tree[node * 2]/*.Freq*/ = 1;
        s.depth[node] = 0;
        s.opt_len--;

        if (has_stree) {
          s.static_len -= stree[node * 2 + 1]/*.Len*/;
        }
        /* node is 0 or 1 so it does not have extra bits */
      }
      desc.max_code = max_code;

      /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
       * establish sub-heaps of increasing lengths:
       */
      for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

      /* Construct the Huffman tree by repeatedly combining the least two
       * frequent nodes.
       */
      node = elems;              /* next internal node of the tree */
      do {
        //pqremove(s, tree, n);  /* n = node of least frequency */
        /*** pqremove ***/
        n = s.heap[1/*SMALLEST*/];
        s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
        pqdownheap(s, tree, 1/*SMALLEST*/);
        /***/

        m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

        s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
        s.heap[--s.heap_max] = m;

        /* Create a new node father of n and m */
        tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
        s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
        tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

        /* and insert the new node in the heap */
        s.heap[1/*SMALLEST*/] = node++;
        pqdownheap(s, tree, 1/*SMALLEST*/);

      } while (s.heap_len >= 2);

      s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

      /* At this point, the fields freq and dad are set. We can now
       * generate the bit lengths.
       */
      gen_bitlen(s, desc);

      /* The field len is now set, we can generate the bit codes */
      gen_codes(tree, max_code, s.bl_count);
    };


    /* ===========================================================================
     * Scan a literal or distance tree to determine the frequencies of the codes
     * in the bit length tree.
     */
    const scan_tree = (s, tree, max_code) => {
    //    deflate_state *s;
    //    ct_data *tree;   /* the tree to be scanned */
    //    int max_code;    /* and its largest code of non zero frequency */

      let n;                     /* iterates over all tree elements */
      let prevlen = -1;          /* last emitted length */
      let curlen;                /* length of current code */

      let nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

      let count = 0;             /* repeat count of the current code */
      let max_count = 7;         /* max repeat count */
      let min_count = 4;         /* min repeat count */

      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

        if (++count < max_count && curlen === nextlen) {
          continue;

        } else if (count < min_count) {
          s.bl_tree[curlen * 2]/*.Freq*/ += count;

        } else if (curlen !== 0) {

          if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
          s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

        } else if (count <= 10) {
          s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

        } else {
          s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
        }

        count = 0;
        prevlen = curlen;

        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;

        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;

        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    };


    /* ===========================================================================
     * Send a literal or distance tree in compressed form, using the codes in
     * bl_tree.
     */
    const send_tree = (s, tree, max_code) => {
    //    deflate_state *s;
    //    ct_data *tree; /* the tree to be scanned */
    //    int max_code;       /* and its largest code of non zero frequency */

      let n;                     /* iterates over all tree elements */
      let prevlen = -1;          /* last emitted length */
      let curlen;                /* length of current code */

      let nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

      let count = 0;             /* repeat count of the current code */
      let max_count = 7;         /* max repeat count */
      let min_count = 4;         /* min repeat count */

      /* tree[max_code+1].Len = -1; */  /* guard already set */
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }

      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

        if (++count < max_count && curlen === nextlen) {
          continue;

        } else if (count < min_count) {
          do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            send_code(s, curlen, s.bl_tree);
            count--;
          }
          //Assert(count >= 3 && count <= 6, " 3_6?");
          send_code(s, REP_3_6, s.bl_tree);
          send_bits(s, count - 3, 2);

        } else if (count <= 10) {
          send_code(s, REPZ_3_10, s.bl_tree);
          send_bits(s, count - 3, 3);

        } else {
          send_code(s, REPZ_11_138, s.bl_tree);
          send_bits(s, count - 11, 7);
        }

        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;

        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;

        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    };


    /* ===========================================================================
     * Construct the Huffman tree for the bit lengths and return the index in
     * bl_order of the last bit length code to send.
     */
    const build_bl_tree = (s) => {

      let max_blindex;  /* index of last bit length code of non zero freq */

      /* Determine the bit length frequencies for literal and distance trees */
      scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
      scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

      /* Build the bit length tree: */
      build_tree(s, s.bl_desc);
      /* opt_len now includes the length of the tree representations, except
       * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
       */

      /* Determine the number of bit length codes to send. The pkzip format
       * requires that at least 4 bit length codes be sent. (appnote.txt says
       * 3 but the actual value used is 4.)
       */
      for (max_blindex = BL_CODES$1 - 1; max_blindex >= 3; max_blindex--) {
        if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
          break;
        }
      }
      /* Update opt_len to include the bit length tree and counts */
      s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
      //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
      //        s->opt_len, s->static_len));

      return max_blindex;
    };


    /* ===========================================================================
     * Send the header for a block using dynamic Huffman trees: the counts, the
     * lengths of the bit length codes, the literal tree and the distance tree.
     * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
     */
    const send_all_trees = (s, lcodes, dcodes, blcodes) => {
    //    deflate_state *s;
    //    int lcodes, dcodes, blcodes; /* number of codes for each tree */

      let rank;                    /* index in bl_order */

      //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
      //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
      //        "too many codes");
      //Tracev((stderr, "\nbl counts: "));
      send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
      send_bits(s, dcodes - 1,   5);
      send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */
      for (rank = 0; rank < blcodes; rank++) {
        //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
        send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
      }
      //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

      send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
      //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

      send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
      //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
    };


    /* ===========================================================================
     * Check if the data type is TEXT or BINARY, using the following algorithm:
     * - TEXT if the two conditions below are satisfied:
     *    a) There are no non-portable control characters belonging to the
     *       "block list" (0..6, 14..25, 28..31).
     *    b) There is at least one printable character belonging to the
     *       "allow list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
     * - BINARY otherwise.
     * - The following partially-portable control characters form a
     *   "gray list" that is ignored in this detection algorithm:
     *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
     * IN assertion: the fields Freq of dyn_ltree are set.
     */
    const detect_data_type = (s) => {
      /* block_mask is the bit mask of block-listed bytes
       * set bits 0..6, 14..25, and 28..31
       * 0xf3ffc07f = binary 11110011111111111100000001111111
       */
      let block_mask = 0xf3ffc07f;
      let n;

      /* Check for non-textual ("block-listed") bytes. */
      for (n = 0; n <= 31; n++, block_mask >>>= 1) {
        if ((block_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
          return Z_BINARY;
        }
      }

      /* Check for textual ("allow-listed") bytes. */
      if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
          s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
        return Z_TEXT;
      }
      for (n = 32; n < LITERALS$1; n++) {
        if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
          return Z_TEXT;
        }
      }

      /* There are no "block-listed" or "allow-listed" bytes:
       * this stream either is empty or has tolerated ("gray-listed") bytes only.
       */
      return Z_BINARY;
    };


    let static_init_done = false;

    /* ===========================================================================
     * Initialize the tree data structures for a new zlib stream.
     */
    const _tr_init$1 = (s) =>
    {

      if (!static_init_done) {
        tr_static_init();
        static_init_done = true;
      }

      s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
      s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
      s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

      s.bi_buf = 0;
      s.bi_valid = 0;

      /* Initialize the first block of the first file: */
      init_block(s);
    };


    /* ===========================================================================
     * Send a stored block
     */
    const _tr_stored_block$1 = (s, buf, stored_len, last) => {
    //DeflateState *s;
    //charf *buf;       /* input block */
    //ulg stored_len;   /* length of input block */
    //int last;         /* one if this is the last block for a file */

      send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
      bi_windup(s);        /* align on byte boundary */
      put_short(s, stored_len);
      put_short(s, ~stored_len);
      if (stored_len) {
        s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
      }
      s.pending += stored_len;
    };


    /* ===========================================================================
     * Send one empty static block to give enough lookahead for inflate.
     * This takes 10 bits, of which 7 may remain in the bit buffer.
     */
    const _tr_align$1 = (s) => {
      send_bits(s, STATIC_TREES << 1, 3);
      send_code(s, END_BLOCK, static_ltree);
      bi_flush(s);
    };


    /* ===========================================================================
     * Determine the best encoding for the current block: dynamic trees, static
     * trees or store, and write out the encoded block.
     */
    const _tr_flush_block$1 = (s, buf, stored_len, last) => {
    //DeflateState *s;
    //charf *buf;       /* input block, or NULL if too old */
    //ulg stored_len;   /* length of input block */
    //int last;         /* one if this is the last block for a file */

      let opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
      let max_blindex = 0;        /* index of last bit length code of non zero freq */

      /* Build the Huffman trees unless a stored block is forced */
      if (s.level > 0) {

        /* Check if the file is binary or text */
        if (s.strm.data_type === Z_UNKNOWN$1) {
          s.strm.data_type = detect_data_type(s);
        }

        /* Construct the literal and distance trees */
        build_tree(s, s.l_desc);
        // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
        //        s->static_len));

        build_tree(s, s.d_desc);
        // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
        //        s->static_len));
        /* At this point, opt_len and static_len are the total bit lengths of
         * the compressed block data, excluding the tree representations.
         */

        /* Build the bit length tree for the above two trees, and get the index
         * in bl_order of the last bit length code to send.
         */
        max_blindex = build_bl_tree(s);

        /* Determine the best encoding. Compute the block lengths in bytes. */
        opt_lenb = (s.opt_len + 3 + 7) >>> 3;
        static_lenb = (s.static_len + 3 + 7) >>> 3;

        // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
        //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
        //        s->sym_next / 3));

        if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

      } else {
        // Assert(buf != (char*)0, "lost buf");
        opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
      }

      if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
        /* 4: two words for the lengths */

        /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
         * Otherwise we can't have processed more than WSIZE input bytes since
         * the last block flush, because compression would have been
         * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
         * transform a block into a stored block.
         */
        _tr_stored_block$1(s, buf, stored_len, last);

      } else if (s.strategy === Z_FIXED$1 || static_lenb === opt_lenb) {

        send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
        compress_block(s, static_ltree, static_dtree);

      } else {
        send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
        send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
        compress_block(s, s.dyn_ltree, s.dyn_dtree);
      }
      // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
      /* The above check is made mod 2^32, for files larger than 512 MB
       * and uLong implemented on 32 bits.
       */
      init_block(s);

      if (last) {
        bi_windup(s);
      }
      // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
      //       s->compressed_len-7*last));
    };

    /* ===========================================================================
     * Save the match info and tally the frequency counts. Return true if
     * the current block must be flushed.
     */
    const _tr_tally$1 = (s, dist, lc) => {
    //    deflate_state *s;
    //    unsigned dist;  /* distance of matched string */
    //    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */

      s.pending_buf[s.sym_buf + s.sym_next++] = dist;
      s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
      s.pending_buf[s.sym_buf + s.sym_next++] = lc;
      if (dist === 0) {
        /* lc is the unmatched char */
        s.dyn_ltree[lc * 2]/*.Freq*/++;
      } else {
        s.matches++;
        /* Here, lc is the match length - MIN_MATCH */
        dist--;             /* dist = match distance - 1 */
        //Assert((ush)dist < (ush)MAX_DIST(s) &&
        //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
        //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

        s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2]/*.Freq*/++;
        s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
      }

      return (s.sym_next === s.sym_end);
    };

    var _tr_init_1  = _tr_init$1;
    var _tr_stored_block_1 = _tr_stored_block$1;
    var _tr_flush_block_1  = _tr_flush_block$1;
    var _tr_tally_1 = _tr_tally$1;
    var _tr_align_1 = _tr_align$1;

    var trees = {
    	_tr_init: _tr_init_1,
    	_tr_stored_block: _tr_stored_block_1,
    	_tr_flush_block: _tr_flush_block_1,
    	_tr_tally: _tr_tally_1,
    	_tr_align: _tr_align_1
    };

    // Note: adler32 takes 12% for level 0 and 2% for level 6.
    // It isn't worth it to make additional optimizations as in original.
    // Small size is preferable.

    // (C) 1995-2013 Jean-loup Gailly and Mark Adler
    // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
    //
    // This software is provided 'as-is', without any express or implied
    // warranty. In no event will the authors be held liable for any damages
    // arising from the use of this software.
    //
    // Permission is granted to anyone to use this software for any purpose,
    // including commercial applications, and to alter it and redistribute it
    // freely, subject to the following restrictions:
    //
    // 1. The origin of this software must not be misrepresented; you must not
    //   claim that you wrote the original software. If you use this software
    //   in a product, an acknowledgment in the product documentation would be
    //   appreciated but is not required.
    // 2. Altered source versions must be plainly marked as such, and must not be
    //   misrepresented as being the original software.
    // 3. This notice may not be removed or altered from any source distribution.

    const adler32 = (adler, buf, len, pos) => {
      let s1 = (adler & 0xffff) |0,
          s2 = ((adler >>> 16) & 0xffff) |0,
          n = 0;

      while (len !== 0) {
        // Set limit ~ twice less than 5552, to keep
        // s2 in 31-bits, because we force signed ints.
        // in other case %= will fail.
        n = len > 2000 ? 2000 : len;
        len -= n;

        do {
          s1 = (s1 + buf[pos++]) |0;
          s2 = (s2 + s1) |0;
        } while (--n);

        s1 %= 65521;
        s2 %= 65521;
      }

      return (s1 | (s2 << 16)) |0;
    };


    var adler32_1 = adler32;

    // Note: we can't get significant speed boost here.
    // So write code to minimize size - no pregenerated tables
    // and array tools dependencies.

    // (C) 1995-2013 Jean-loup Gailly and Mark Adler
    // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
    //
    // This software is provided 'as-is', without any express or implied
    // warranty. In no event will the authors be held liable for any damages
    // arising from the use of this software.
    //
    // Permission is granted to anyone to use this software for any purpose,
    // including commercial applications, and to alter it and redistribute it
    // freely, subject to the following restrictions:
    //
    // 1. The origin of this software must not be misrepresented; you must not
    //   claim that you wrote the original software. If you use this software
    //   in a product, an acknowledgment in the product documentation would be
    //   appreciated but is not required.
    // 2. Altered source versions must be plainly marked as such, and must not be
    //   misrepresented as being the original software.
    // 3. This notice may not be removed or altered from any source distribution.

    // Use ordinary array, since untyped makes no boost here
    const makeTable = () => {
      let c, table = [];

      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[n] = c;
      }

      return table;
    };

    // Create table on load. Just 255 signed longs. Not a problem.
    const crcTable = new Uint32Array(makeTable());


    const crc32 = (crc, buf, len, pos) => {
      const t = crcTable;
      const end = pos + len;

      crc ^= -1;

      for (let i = pos; i < end; i++) {
        crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
      }

      return (crc ^ (-1)); // >>> 0;
    };


    var crc32_1 = crc32;

    // (C) 1995-2013 Jean-loup Gailly and Mark Adler
    // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
    //
    // This software is provided 'as-is', without any express or implied
    // warranty. In no event will the authors be held liable for any damages
    // arising from the use of this software.
    //
    // Permission is granted to anyone to use this software for any purpose,
    // including commercial applications, and to alter it and redistribute it
    // freely, subject to the following restrictions:
    //
    // 1. The origin of this software must not be misrepresented; you must not
    //   claim that you wrote the original software. If you use this software
    //   in a product, an acknowledgment in the product documentation would be
    //   appreciated but is not required.
    // 2. Altered source versions must be plainly marked as such, and must not be
    //   misrepresented as being the original software.
    // 3. This notice may not be removed or altered from any source distribution.

    var messages = {
      2:      'need dictionary',     /* Z_NEED_DICT       2  */
      1:      'stream end',          /* Z_STREAM_END      1  */
      0:      '',                    /* Z_OK              0  */
      '-1':   'file error',          /* Z_ERRNO         (-1) */
      '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
      '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
      '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
      '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
      '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
    };

    // (C) 1995-2013 Jean-loup Gailly and Mark Adler
    // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
    //
    // This software is provided 'as-is', without any express or implied
    // warranty. In no event will the authors be held liable for any damages
    // arising from the use of this software.
    //
    // Permission is granted to anyone to use this software for any purpose,
    // including commercial applications, and to alter it and redistribute it
    // freely, subject to the following restrictions:
    //
    // 1. The origin of this software must not be misrepresented; you must not
    //   claim that you wrote the original software. If you use this software
    //   in a product, an acknowledgment in the product documentation would be
    //   appreciated but is not required.
    // 2. Altered source versions must be plainly marked as such, and must not be
    //   misrepresented as being the original software.
    // 3. This notice may not be removed or altered from any source distribution.

    var constants$2 = {

      /* Allowed flush values; see deflate() and inflate() below for details */
      Z_NO_FLUSH:         0,
      Z_PARTIAL_FLUSH:    1,
      Z_SYNC_FLUSH:       2,
      Z_FULL_FLUSH:       3,
      Z_FINISH:           4,
      Z_BLOCK:            5,
      Z_TREES:            6,

      /* Return codes for the compression/decompression functions. Negative values
      * are errors, positive values are used for special but normal events.
      */
      Z_OK:               0,
      Z_STREAM_END:       1,
      Z_NEED_DICT:        2,
      Z_ERRNO:           -1,
      Z_STREAM_ERROR:    -2,
      Z_DATA_ERROR:      -3,
      Z_MEM_ERROR:       -4,
      Z_BUF_ERROR:       -5,
      //Z_VERSION_ERROR: -6,

      /* compression levels */
      Z_NO_COMPRESSION:         0,
      Z_BEST_SPEED:             1,
      Z_BEST_COMPRESSION:       9,
      Z_DEFAULT_COMPRESSION:   -1,


      Z_FILTERED:               1,
      Z_HUFFMAN_ONLY:           2,
      Z_RLE:                    3,
      Z_FIXED:                  4,
      Z_DEFAULT_STRATEGY:       0,

      /* Possible values of the data_type field (though see inflate()) */
      Z_BINARY:                 0,
      Z_TEXT:                   1,
      //Z_ASCII:                1, // = Z_TEXT (deprecated)
      Z_UNKNOWN:                2,

      /* The deflate compression method */
      Z_DEFLATED:               8
      //Z_NULL:                 null // Use -1 or null inline, depending on var type
    };

    // (C) 1995-2013 Jean-loup Gailly and Mark Adler
    // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
    //
    // This software is provided 'as-is', without any express or implied
    // warranty. In no event will the authors be held liable for any damages
    // arising from the use of this software.
    //
    // Permission is granted to anyone to use this software for any purpose,
    // including commercial applications, and to alter it and redistribute it
    // freely, subject to the following restrictions:
    //
    // 1. The origin of this software must not be misrepresented; you must not
    //   claim that you wrote the original software. If you use this software
    //   in a product, an acknowledgment in the product documentation would be
    //   appreciated but is not required.
    // 2. Altered source versions must be plainly marked as such, and must not be
    //   misrepresented as being the original software.
    // 3. This notice may not be removed or altered from any source distribution.

    const { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = trees;




    /* Public constants ==========================================================*/
    /* ===========================================================================*/

    const {
      Z_NO_FLUSH: Z_NO_FLUSH$2, Z_PARTIAL_FLUSH, Z_FULL_FLUSH: Z_FULL_FLUSH$1, Z_FINISH: Z_FINISH$3, Z_BLOCK: Z_BLOCK$1,
      Z_OK: Z_OK$3, Z_STREAM_END: Z_STREAM_END$3, Z_STREAM_ERROR: Z_STREAM_ERROR$2, Z_DATA_ERROR: Z_DATA_ERROR$2, Z_BUF_ERROR: Z_BUF_ERROR$1,
      Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1,
      Z_FILTERED, Z_HUFFMAN_ONLY, Z_RLE, Z_FIXED, Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1,
      Z_UNKNOWN,
      Z_DEFLATED: Z_DEFLATED$2
    } = constants$2;

    /*============================================================================*/


    const MAX_MEM_LEVEL = 9;
    /* Maximum value for memLevel in deflateInit2 */
    const MAX_WBITS$1 = 15;
    /* 32K LZ77 window */
    const DEF_MEM_LEVEL = 8;


    const LENGTH_CODES  = 29;
    /* number of length codes, not counting the special END_BLOCK code */
    const LITERALS      = 256;
    /* number of literal bytes 0..255 */
    const L_CODES       = LITERALS + 1 + LENGTH_CODES;
    /* number of Literal or Length codes, including the END_BLOCK code */
    const D_CODES       = 30;
    /* number of distance codes */
    const BL_CODES      = 19;
    /* number of codes used to transfer the bit lengths */
    const HEAP_SIZE     = 2 * L_CODES + 1;
    /* maximum heap size */
    const MAX_BITS  = 15;
    /* All codes must not exceed MAX_BITS bits */

    const MIN_MATCH = 3;
    const MAX_MATCH = 258;
    const MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

    const PRESET_DICT = 0x20;

    const INIT_STATE    =  42;    /* zlib header -> BUSY_STATE */
    //#ifdef GZIP
    const GZIP_STATE    =  57;    /* gzip header -> BUSY_STATE | EXTRA_STATE */
    //#endif
    const EXTRA_STATE   =  69;    /* gzip extra block -> NAME_STATE */
    const NAME_STATE    =  73;    /* gzip file name -> COMMENT_STATE */
    const COMMENT_STATE =  91;    /* gzip comment -> HCRC_STATE */
    const HCRC_STATE    = 103;    /* gzip header CRC -> BUSY_STATE */
    const BUSY_STATE    = 113;    /* deflate -> FINISH_STATE */
    const FINISH_STATE  = 666;    /* stream complete */

    const BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
    const BS_BLOCK_DONE     = 2; /* block flush performed */
    const BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
    const BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

    const OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

    const err = (strm, errorCode) => {
      strm.msg = messages[errorCode];
      return errorCode;
    };

    const rank = (f) => {
      return ((f) * 2) - ((f) > 4 ? 9 : 0);
    };

    const zero = (buf) => {
      let len = buf.length; while (--len >= 0) { buf[len] = 0; }
    };

    /* ===========================================================================
     * Slide the hash table when sliding the window down (could be avoided with 32
     * bit values at the expense of memory usage). We slide even when level == 0 to
     * keep the hash table consistent if we switch back to level > 0 later.
     */
    const slide_hash = (s) => {
      let n, m;
      let p;
      let wsize = s.w_size;

      n = s.hash_size;
      p = n;
      do {
        m = s.head[--p];
        s.head[p] = (m >= wsize ? m - wsize : 0);
      } while (--n);
      n = wsize;
    //#ifndef FASTEST
      p = n;
      do {
        m = s.prev[--p];
        s.prev[p] = (m >= wsize ? m - wsize : 0);
        /* If n is not on any hash chain, prev[n] is garbage but
         * its value will never be used.
         */
      } while (--n);
    //#endif
    };

    /* eslint-disable new-cap */
    let HASH_ZLIB = (s, prev, data) => ((prev << s.hash_shift) ^ data) & s.hash_mask;
    // This hash causes less collisions, https://github.com/nodeca/pako/issues/135
    // But breaks binary compatibility
    //let HASH_FAST = (s, prev, data) => ((prev << 8) + (prev >> 8) + (data << 4)) & s.hash_mask;
    let HASH = HASH_ZLIB;


    /* =========================================================================
     * Flush as much pending output as possible. All deflate() output, except for
     * some deflate_stored() output, goes through this function so some
     * applications may wish to modify it to avoid allocating a large
     * strm->next_out buffer and copying into it. (See also read_buf()).
     */
    const flush_pending = (strm) => {
      const s = strm.state;

      //_tr_flush_bits(s);
      let len = s.pending;
      if (len > strm.avail_out) {
        len = strm.avail_out;
      }
      if (len === 0) { return; }

      strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
      strm.next_out  += len;
      s.pending_out  += len;
      strm.total_out += len;
      strm.avail_out -= len;
      s.pending      -= len;
      if (s.pending === 0) {
        s.pending_out = 0;
      }
    };


    const flush_block_only = (s, last) => {
      _tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
      s.block_start = s.strstart;
      flush_pending(s.strm);
    };


    const put_byte = (s, b) => {
      s.pending_buf[s.pending++] = b;
    };


    /* =========================================================================
     * Put a short in the pending buffer. The 16-bit value is put in MSB order.
     * IN assertion: the stream state is correct and there is enough room in
     * pending_buf.
     */
    const putShortMSB = (s, b) => {

      //  put_byte(s, (Byte)(b >> 8));
    //  put_byte(s, (Byte)(b & 0xff));
      s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
      s.pending_buf[s.pending++] = b & 0xff;
    };


    /* ===========================================================================
     * Read a new buffer from the current input stream, update the adler32
     * and total number of bytes read.  All deflate() input goes through
     * this function so some applications may wish to modify it to avoid
     * allocating a large strm->input buffer and copying from it.
     * (See also flush_pending()).
     */
    const read_buf = (strm, buf, start, size) => {

      let len = strm.avail_in;

      if (len > size) { len = size; }
      if (len === 0) { return 0; }

      strm.avail_in -= len;

      // zmemcpy(buf, strm->next_in, len);
      buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
      if (strm.state.wrap === 1) {
        strm.adler = adler32_1(strm.adler, buf, len, start);
      }

      else if (strm.state.wrap === 2) {
        strm.adler = crc32_1(strm.adler, buf, len, start);
      }

      strm.next_in += len;
      strm.total_in += len;

      return len;
    };


    /* ===========================================================================
     * Set match_start to the longest match starting at the given string and
     * return its length. Matches shorter or equal to prev_length are discarded,
     * in which case the result is equal to prev_length and match_start is
     * garbage.
     * IN assertions: cur_match is the head of the hash chain for the current
     *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
     * OUT assertion: the match length is not greater than s->lookahead.
     */
    const longest_match = (s, cur_match) => {

      let chain_length = s.max_chain_length;      /* max hash chain length */
      let scan = s.strstart; /* current string */
      let match;                       /* matched string */
      let len;                           /* length of current match */
      let best_len = s.prev_length;              /* best match length so far */
      let nice_match = s.nice_match;             /* stop if match long enough */
      const limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
          s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

      const _win = s.window; // shortcut

      const wmask = s.w_mask;
      const prev  = s.prev;

      /* Stop when cur_match becomes <= limit. To simplify the code,
       * we prevent matches with the string of window index 0.
       */

      const strend = s.strstart + MAX_MATCH;
      let scan_end1  = _win[scan + best_len - 1];
      let scan_end   = _win[scan + best_len];

      /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
       * It is easy to get rid of this optimization if necessary.
       */
      // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

      /* Do not waste too much time if we already have a good match: */
      if (s.prev_length >= s.good_match) {
        chain_length >>= 2;
      }
      /* Do not look for matches beyond the end of the input. This is necessary
       * to make deflate deterministic.
       */
      if (nice_match > s.lookahead) { nice_match = s.lookahead; }

      // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

      do {
        // Assert(cur_match < s->strstart, "no future");
        match = cur_match;

        /* Skip to next match if the match length cannot increase
         * or if the match length is less than 2.  Note that the checks below
         * for insufficient lookahead only occur occasionally for performance
         * reasons.  Therefore uninitialized memory will be accessed, and
         * conditional jumps will be made that depend on those values.
         * However the length of the match is limited to the lookahead, so
         * the output of deflate is not affected by the uninitialized values.
         */

        if (_win[match + best_len]     !== scan_end  ||
            _win[match + best_len - 1] !== scan_end1 ||
            _win[match]                !== _win[scan] ||
            _win[++match]              !== _win[scan + 1]) {
          continue;
        }

        /* The check at best_len-1 can be removed because it will be made
         * again later. (This heuristic is not always a win.)
         * It is not necessary to compare scan[2] and match[2] since they
         * are always equal when the other bytes match, given that
         * the hash keys are equal and that HASH_BITS >= 8.
         */
        scan += 2;
        match++;
        // Assert(*scan == *match, "match[2]?");

        /* We check for insufficient lookahead only every 8th comparison;
         * the 256th check will be made at strstart+258.
         */
        do {
          /*jshint noempty:false*/
        } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
                 _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
                 _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
                 _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
                 scan < strend);

        // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

        len = MAX_MATCH - (strend - scan);
        scan = strend - MAX_MATCH;

        if (len > best_len) {
          s.match_start = cur_match;
          best_len = len;
          if (len >= nice_match) {
            break;
          }
          scan_end1  = _win[scan + best_len - 1];
          scan_end   = _win[scan + best_len];
        }
      } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

      if (best_len <= s.lookahead) {
        return best_len;
      }
      return s.lookahead;
    };


    /* ===========================================================================
     * Fill the window when the lookahead becomes insufficient.
     * Updates strstart and lookahead.
     *
     * IN assertion: lookahead < MIN_LOOKAHEAD
     * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
     *    At least one byte has been read, or avail_in == 0; reads are
     *    performed for at least two bytes (required for the zip translate_eol
     *    option -- not supported here).
     */
    const fill_window = (s) => {

      const _w_size = s.w_size;
      let n, more, str;

      //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

      do {
        more = s.window_size - s.lookahead - s.strstart;

        // JS ints have 32 bit, block below not needed
        /* Deal with !@#$% 64K limit: */
        //if (sizeof(int) <= 2) {
        //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
        //        more = wsize;
        //
        //  } else if (more == (unsigned)(-1)) {
        //        /* Very unlikely, but possible on 16 bit machine if
        //         * strstart == 0 && lookahead == 1 (input done a byte at time)
        //         */
        //        more--;
        //    }
        //}


        /* If the window is almost full and there is insufficient lookahead,
         * move the upper half to the lower one to make room in the upper half.
         */
        if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

          s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
          s.match_start -= _w_size;
          s.strstart -= _w_size;
          /* we now have strstart >= MAX_DIST */
          s.block_start -= _w_size;
          if (s.insert > s.strstart) {
            s.insert = s.strstart;
          }
          slide_hash(s);
          more += _w_size;
        }
        if (s.strm.avail_in === 0) {
          break;
        }

        /* If there was no sliding:
         *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
         *    more == window_size - lookahead - strstart
         * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
         * => more >= window_size - 2*WSIZE + 2
         * In the BIG_MEM or MMAP case (not yet supported),
         *   window_size == input_size + MIN_LOOKAHEAD  &&
         *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
         * Otherwise, window_size == 2*WSIZE so more >= 2.
         * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
         */
        //Assert(more >= 2, "more < 2");
        n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
        s.lookahead += n;

        /* Initialize the hash value now that we have some input: */
        if (s.lookahead + s.insert >= MIN_MATCH) {
          str = s.strstart - s.insert;
          s.ins_h = s.window[str];

          /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
          s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
    //#if MIN_MATCH != 3
    //        Call update_hash() MIN_MATCH-3 more times
    //#endif
          while (s.insert) {
            /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
            s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);

            s.prev[str & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = str;
            str++;
            s.insert--;
            if (s.lookahead + s.insert < MIN_MATCH) {
              break;
            }
          }
        }
        /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
         * but this is not important since only literal bytes will be emitted.
         */

      } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

      /* If the WIN_INIT bytes after the end of the current data have never been
       * written, then zero those bytes in order to avoid memory check reports of
       * the use of uninitialized (or uninitialised as Julian writes) bytes by
       * the longest match routines.  Update the high water mark for the next
       * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
       * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
       */
    //  if (s.high_water < s.window_size) {
    //    const curr = s.strstart + s.lookahead;
    //    let init = 0;
    //
    //    if (s.high_water < curr) {
    //      /* Previous high water mark below current data -- zero WIN_INIT
    //       * bytes or up to end of window, whichever is less.
    //       */
    //      init = s.window_size - curr;
    //      if (init > WIN_INIT)
    //        init = WIN_INIT;
    //      zmemzero(s->window + curr, (unsigned)init);
    //      s->high_water = curr + init;
    //    }
    //    else if (s->high_water < (ulg)curr + WIN_INIT) {
    //      /* High water mark at or above current data, but below current data
    //       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
    //       * to end of window, whichever is less.
    //       */
    //      init = (ulg)curr + WIN_INIT - s->high_water;
    //      if (init > s->window_size - s->high_water)
    //        init = s->window_size - s->high_water;
    //      zmemzero(s->window + s->high_water, (unsigned)init);
    //      s->high_water += init;
    //    }
    //  }
    //
    //  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
    //    "not enough room for search");
    };

    /* ===========================================================================
     * Copy without compression as much as possible from the input stream, return
     * the current block state.
     *
     * In case deflateParams() is used to later switch to a non-zero compression
     * level, s->matches (otherwise unused when storing) keeps track of the number
     * of hash table slides to perform. If s->matches is 1, then one hash table
     * slide will be done when switching. If s->matches is 2, the maximum value
     * allowed here, then the hash table will be cleared, since two or more slides
     * is the same as a clear.
     *
     * deflate_stored() is written to minimize the number of times an input byte is
     * copied. It is most efficient with large input and output buffers, which
     * maximizes the opportunites to have a single copy from next_in to next_out.
     */
    const deflate_stored = (s, flush) => {

      /* Smallest worthy block size when not flushing or finishing. By default
       * this is 32K. This can be as small as 507 bytes for memLevel == 1. For
       * large input and output buffers, the stored block size will be larger.
       */
      let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;

      /* Copy as many min_block or larger stored blocks directly to next_out as
       * possible. If flushing, copy the remaining available input to next_out as
       * stored blocks, if there is enough space.
       */
      let len, left, have, last = 0;
      let used = s.strm.avail_in;
      do {
        /* Set len to the maximum size block that we can copy directly with the
         * available input data and output space. Set left to how much of that
         * would be copied from what's left in the window.
         */
        len = 65535/* MAX_STORED */;     /* maximum deflate stored block length */
        have = (s.bi_valid + 42) >> 3;     /* number of header bytes */
        if (s.strm.avail_out < have) {         /* need room for header */
          break;
        }
          /* maximum stored block length that will fit in avail_out: */
        have = s.strm.avail_out - have;
        left = s.strstart - s.block_start;  /* bytes left in window */
        if (len > left + s.strm.avail_in) {
          len = left + s.strm.avail_in;   /* limit len to the input */
        }
        if (len > have) {
          len = have;             /* limit len to the output */
        }

        /* If the stored block would be less than min_block in length, or if
         * unable to copy all of the available input when flushing, then try
         * copying to the window and the pending buffer instead. Also don't
         * write an empty block when flushing -- deflate() does that.
         */
        if (len < min_block && ((len === 0 && flush !== Z_FINISH$3) ||
                            flush === Z_NO_FLUSH$2 ||
                            len !== left + s.strm.avail_in)) {
          break;
        }

        /* Make a dummy stored block in pending to get the header bytes,
         * including any pending bits. This also updates the debugging counts.
         */
        last = flush === Z_FINISH$3 && len === left + s.strm.avail_in ? 1 : 0;
        _tr_stored_block(s, 0, 0, last);

        /* Replace the lengths in the dummy stored block with len. */
        s.pending_buf[s.pending - 4] = len;
        s.pending_buf[s.pending - 3] = len >> 8;
        s.pending_buf[s.pending - 2] = ~len;
        s.pending_buf[s.pending - 1] = ~len >> 8;

        /* Write the stored block header bytes. */
        flush_pending(s.strm);

    //#ifdef ZLIB_DEBUG
    //    /* Update debugging counts for the data about to be copied. */
    //    s->compressed_len += len << 3;
    //    s->bits_sent += len << 3;
    //#endif

        /* Copy uncompressed bytes from the window to next_out. */
        if (left) {
          if (left > len) {
            left = len;
          }
          //zmemcpy(s->strm->next_out, s->window + s->block_start, left);
          s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
          s.strm.next_out += left;
          s.strm.avail_out -= left;
          s.strm.total_out += left;
          s.block_start += left;
          len -= left;
        }

        /* Copy uncompressed bytes directly from next_in to next_out, updating
         * the check value.
         */
        if (len) {
          read_buf(s.strm, s.strm.output, s.strm.next_out, len);
          s.strm.next_out += len;
          s.strm.avail_out -= len;
          s.strm.total_out += len;
        }
      } while (last === 0);

      /* Update the sliding window with the last s->w_size bytes of the copied
       * data, or append all of the copied data to the existing window if less
       * than s->w_size bytes were copied. Also update the number of bytes to
       * insert in the hash tables, in the event that deflateParams() switches to
       * a non-zero compression level.
       */
      used -= s.strm.avail_in;    /* number of input bytes directly copied */
      if (used) {
        /* If any input was used, then no unused input remains in the window,
         * therefore s->block_start == s->strstart.
         */
        if (used >= s.w_size) {  /* supplant the previous history */
          s.matches = 2;     /* clear hash */
          //zmemcpy(s->window, s->strm->next_in - s->w_size, s->w_size);
          s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
          s.strstart = s.w_size;
          s.insert = s.strstart;
        }
        else {
          if (s.window_size - s.strstart <= used) {
            /* Slide the window down. */
            s.strstart -= s.w_size;
            //zmemcpy(s->window, s->window + s->w_size, s->strstart);
            s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
            if (s.matches < 2) {
              s.matches++;   /* add a pending slide_hash() */
            }
            if (s.insert > s.strstart) {
              s.insert = s.strstart;
            }
          }
          //zmemcpy(s->window + s->strstart, s->strm->next_in - used, used);
          s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
          s.strstart += used;
          s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
        }
        s.block_start = s.strstart;
      }
      if (s.high_water < s.strstart) {
        s.high_water = s.strstart;
      }

      /* If the last block was written to next_out, then done. */
      if (last) {
        return BS_FINISH_DONE;
      }

      /* If flushing and all input has been consumed, then done. */
      if (flush !== Z_NO_FLUSH$2 && flush !== Z_FINISH$3 &&
        s.strm.avail_in === 0 && s.strstart === s.block_start) {
        return BS_BLOCK_DONE;
      }

      /* Fill the window with any remaining input. */
      have = s.window_size - s.strstart;
      if (s.strm.avail_in > have && s.block_start >= s.w_size) {
        /* Slide the window down. */
        s.block_start -= s.w_size;
        s.strstart -= s.w_size;
        //zmemcpy(s->window, s->window + s->w_size, s->strstart);
        s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
        if (s.matches < 2) {
          s.matches++;       /* add a pending slide_hash() */
        }
        have += s.w_size;      /* more space now */
        if (s.insert > s.strstart) {
          s.insert = s.strstart;
        }
      }
      if (have > s.strm.avail_in) {
        have = s.strm.avail_in;
      }
      if (have) {
        read_buf(s.strm, s.window, s.strstart, have);
        s.strstart += have;
        s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
      }
      if (s.high_water < s.strstart) {
        s.high_water = s.strstart;
      }

      /* There was not enough avail_out to write a complete worthy or flushed
       * stored block to next_out. Write a stored block to pending instead, if we
       * have enough input for a worthy block, or if flushing and there is enough
       * room for the remaining input as a stored block in the pending buffer.
       */
      have = (s.bi_valid + 42) >> 3;     /* number of header bytes */
        /* maximum stored block length that will fit in pending: */
      have = s.pending_buf_size - have > 65535/* MAX_STORED */ ? 65535/* MAX_STORED */ : s.pending_buf_size - have;
      min_block = have > s.w_size ? s.w_size : have;
      left = s.strstart - s.block_start;
      if (left >= min_block ||
         ((left || flush === Z_FINISH$3) && flush !== Z_NO_FLUSH$2 &&
         s.strm.avail_in === 0 && left <= have)) {
        len = left > have ? have : left;
        last = flush === Z_FINISH$3 && s.strm.avail_in === 0 &&
             len === left ? 1 : 0;
        _tr_stored_block(s, s.block_start, len, last);
        s.block_start += len;
        flush_pending(s.strm);
      }

      /* We've done all we can with the available input and output. */
      return last ? BS_FINISH_STARTED : BS_NEED_MORE;
    };


    /* ===========================================================================
     * Compress as much as possible from the input stream, return the current
     * block state.
     * This function does not perform lazy evaluation of matches and inserts
     * new strings in the dictionary only for unmatched strings or for short
     * matches. It is used only for the fast compression options.
     */
    const deflate_fast = (s, flush) => {

      let hash_head;        /* head of the hash chain */
      let bflush;           /* set if current block must be flushed */

      for (;;) {
        /* Make sure that we always have enough lookahead, except
         * at the end of the input file. We need MAX_MATCH bytes
         * for the next match, plus MIN_MATCH bytes to insert the
         * string following the next match.
         */
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break; /* flush the current block */
          }
        }

        /* Insert the string window[strstart .. strstart+2] in the
         * dictionary, and set hash_head to the head of the hash chain:
         */
        hash_head = 0/*NIL*/;
        if (s.lookahead >= MIN_MATCH) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }

        /* Find the longest match, discarding those <= prev_length.
         * At this point we have always match_length < MIN_MATCH
         */
        if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
          /* To simplify the code, we prevent matches with the string
           * of window index 0 (in particular we have to avoid a match
           * of the string with itself at the start of the input file).
           */
          s.match_length = longest_match(s, hash_head);
          /* longest_match() sets match_start */
        }
        if (s.match_length >= MIN_MATCH) {
          // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

          /*** _tr_tally_dist(s, s.strstart - s.match_start,
                         s.match_length - MIN_MATCH, bflush); ***/
          bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

          s.lookahead -= s.match_length;

          /* Insert new strings in the hash table only if the match length
           * is not too large. This saves time but degrades compression.
           */
          if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
            s.match_length--; /* string at strstart already in table */
            do {
              s.strstart++;
              /*** INSERT_STRING(s, s.strstart, hash_head); ***/
              s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
              /***/
              /* strstart never exceeds WSIZE-MAX_MATCH, so there are
               * always MIN_MATCH bytes ahead.
               */
            } while (--s.match_length !== 0);
            s.strstart++;
          } else
          {
            s.strstart += s.match_length;
            s.match_length = 0;
            s.ins_h = s.window[s.strstart];
            /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
            s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);

    //#if MIN_MATCH != 3
    //                Call UPDATE_HASH() MIN_MATCH-3 more times
    //#endif
            /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
             * matter since it will be recomputed at next deflate call.
             */
          }
        } else {
          /* No match, output a literal byte */
          //Tracevv((stderr,"%c", s.window[s.strstart]));
          /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
          bflush = _tr_tally(s, 0, s.window[s.strstart]);

          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          /*** FLUSH_BLOCK(s, 0); ***/
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
          /***/
        }
      }
      s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
      if (flush === Z_FINISH$3) {
        /*** FLUSH_BLOCK(s, 1); ***/
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        /***/
        return BS_FINISH_DONE;
      }
      if (s.sym_next) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }
      return BS_BLOCK_DONE;
    };

    /* ===========================================================================
     * Same as above, but achieves better compression. We use a lazy
     * evaluation for matches: a match is finally adopted only if there is
     * no better match at the next window position.
     */
    const deflate_slow = (s, flush) => {

      let hash_head;          /* head of hash chain */
      let bflush;              /* set if current block must be flushed */

      let max_insert;

      /* Process the input block. */
      for (;;) {
        /* Make sure that we always have enough lookahead, except
         * at the end of the input file. We need MAX_MATCH bytes
         * for the next match, plus MIN_MATCH bytes to insert the
         * string following the next match.
         */
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) { break; } /* flush the current block */
        }

        /* Insert the string window[strstart .. strstart+2] in the
         * dictionary, and set hash_head to the head of the hash chain:
         */
        hash_head = 0/*NIL*/;
        if (s.lookahead >= MIN_MATCH) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }

        /* Find the longest match, discarding those <= prev_length.
         */
        s.prev_length = s.match_length;
        s.prev_match = s.match_start;
        s.match_length = MIN_MATCH - 1;

        if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
            s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
          /* To simplify the code, we prevent matches with the string
           * of window index 0 (in particular we have to avoid a match
           * of the string with itself at the start of the input file).
           */
          s.match_length = longest_match(s, hash_head);
          /* longest_match() sets match_start */

          if (s.match_length <= 5 &&
             (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

            /* If prev_match is also MIN_MATCH, match_start is garbage
             * but we will ignore the current match anyway.
             */
            s.match_length = MIN_MATCH - 1;
          }
        }
        /* If there was a match at the previous step and the current
         * match is not better, output the previous match:
         */
        if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
          max_insert = s.strstart + s.lookahead - MIN_MATCH;
          /* Do not insert strings in hash table beyond this. */

          //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

          /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                         s.prev_length - MIN_MATCH, bflush);***/
          bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
          /* Insert in hash table all strings up to the end of the match.
           * strstart-1 and strstart are already inserted. If there is not
           * enough lookahead, the last two strings are not inserted in
           * the hash table.
           */
          s.lookahead -= s.prev_length - 1;
          s.prev_length -= 2;
          do {
            if (++s.strstart <= max_insert) {
              /*** INSERT_STRING(s, s.strstart, hash_head); ***/
              s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
              /***/
            }
          } while (--s.prev_length !== 0);
          s.match_available = 0;
          s.match_length = MIN_MATCH - 1;
          s.strstart++;

          if (bflush) {
            /*** FLUSH_BLOCK(s, 0); ***/
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
            /***/
          }

        } else if (s.match_available) {
          /* If there was no match at the previous position, output a
           * single literal. If there was a match but the current match
           * is longer, truncate the previous match to a single literal.
           */
          //Tracevv((stderr,"%c", s->window[s->strstart-1]));
          /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
          bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

          if (bflush) {
            /*** FLUSH_BLOCK_ONLY(s, 0) ***/
            flush_block_only(s, false);
            /***/
          }
          s.strstart++;
          s.lookahead--;
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        } else {
          /* There is no previous match to compare with, wait for
           * the next step to decide.
           */
          s.match_available = 1;
          s.strstart++;
          s.lookahead--;
        }
      }
      //Assert (flush != Z_NO_FLUSH, "no flush?");
      if (s.match_available) {
        //Tracevv((stderr,"%c", s->window[s->strstart-1]));
        /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
        bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

        s.match_available = 0;
      }
      s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
      if (flush === Z_FINISH$3) {
        /*** FLUSH_BLOCK(s, 1); ***/
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        /***/
        return BS_FINISH_DONE;
      }
      if (s.sym_next) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

      return BS_BLOCK_DONE;
    };


    /* ===========================================================================
     * For Z_RLE, simply look for runs of bytes, generate matches only of distance
     * one.  Do not maintain a hash table.  (It will be regenerated if this run of
     * deflate switches away from Z_RLE.)
     */
    const deflate_rle = (s, flush) => {

      let bflush;            /* set if current block must be flushed */
      let prev;              /* byte at distance one to match */
      let scan, strend;      /* scan goes up to strend for length of run */

      const _win = s.window;

      for (;;) {
        /* Make sure that we always have enough lookahead, except
         * at the end of the input file. We need MAX_MATCH bytes
         * for the longest run, plus one for the unrolled loop.
         */
        if (s.lookahead <= MAX_MATCH) {
          fill_window(s);
          if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$2) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) { break; } /* flush the current block */
        }

        /* See how many times the previous byte repeats */
        s.match_length = 0;
        if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
          scan = s.strstart - 1;
          prev = _win[scan];
          if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
            strend = s.strstart + MAX_MATCH;
            do {
              /*jshint noempty:false*/
            } while (prev === _win[++scan] && prev === _win[++scan] &&
                     prev === _win[++scan] && prev === _win[++scan] &&
                     prev === _win[++scan] && prev === _win[++scan] &&
                     prev === _win[++scan] && prev === _win[++scan] &&
                     scan < strend);
            s.match_length = MAX_MATCH - (strend - scan);
            if (s.match_length > s.lookahead) {
              s.match_length = s.lookahead;
            }
          }
          //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
        }

        /* Emit match if have run of MIN_MATCH or longer, else emit literal */
        if (s.match_length >= MIN_MATCH) {
          //check_match(s, s.strstart, s.strstart - 1, s.match_length);

          /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
          bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);

          s.lookahead -= s.match_length;
          s.strstart += s.match_length;
          s.match_length = 0;
        } else {
          /* No match, output a literal byte */
          //Tracevv((stderr,"%c", s->window[s->strstart]));
          /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
          bflush = _tr_tally(s, 0, s.window[s.strstart]);

          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          /*** FLUSH_BLOCK(s, 0); ***/
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
          /***/
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH$3) {
        /*** FLUSH_BLOCK(s, 1); ***/
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        /***/
        return BS_FINISH_DONE;
      }
      if (s.sym_next) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }
      return BS_BLOCK_DONE;
    };

    /* ===========================================================================
     * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
     * (It will be regenerated if this run of deflate switches away from Huffman.)
     */
    const deflate_huff = (s, flush) => {

      let bflush;             /* set if current block must be flushed */

      for (;;) {
        /* Make sure that we have a literal to write. */
        if (s.lookahead === 0) {
          fill_window(s);
          if (s.lookahead === 0) {
            if (flush === Z_NO_FLUSH$2) {
              return BS_NEED_MORE;
            }
            break;      /* flush the current block */
          }
        }

        /* Output a literal byte */
        s.match_length = 0;
        //Tracevv((stderr,"%c", s->window[s->strstart]));
        /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
        bflush = _tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
        if (bflush) {
          /*** FLUSH_BLOCK(s, 0); ***/
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
          /***/
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH$3) {
        /*** FLUSH_BLOCK(s, 1); ***/
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        /***/
        return BS_FINISH_DONE;
      }
      if (s.sym_next) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }
      return BS_BLOCK_DONE;
    };

    /* Values for max_lazy_match, good_match and max_chain_length, depending on
     * the desired pack level (0..9). The values given below have been tuned to
     * exclude worst case performance for pathological files. Better values may be
     * found for specific files.
     */
    function Config(good_length, max_lazy, nice_length, max_chain, func) {

      this.good_length = good_length;
      this.max_lazy = max_lazy;
      this.nice_length = nice_length;
      this.max_chain = max_chain;
      this.func = func;
    }

    const configuration_table = [
      /*      good lazy nice chain */
      new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
      new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
      new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
      new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

      new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
      new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
      new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
      new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
      new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
      new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
    ];


    /* ===========================================================================
     * Initialize the "longest match" routines for a new zlib stream
     */
    const lm_init = (s) => {

      s.window_size = 2 * s.w_size;

      /*** CLEAR_HASH(s); ***/
      zero(s.head); // Fill with NIL (= 0);

      /* Set the default configuration parameters:
       */
      s.max_lazy_match = configuration_table[s.level].max_lazy;
      s.good_match = configuration_table[s.level].good_length;
      s.nice_match = configuration_table[s.level].nice_length;
      s.max_chain_length = configuration_table[s.level].max_chain;

      s.strstart = 0;
      s.block_start = 0;
      s.lookahead = 0;
      s.insert = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      s.ins_h = 0;
    };


    function DeflateState() {
      this.strm = null;            /* pointer back to this zlib stream */
      this.status = 0;            /* as the name implies */
      this.pending_buf = null;      /* output still pending */
      this.pending_buf_size = 0;  /* size of pending_buf */
      this.pending_out = 0;       /* next pending byte to output to the stream */
      this.pending = 0;           /* nb of bytes in the pending buffer */
      this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
      this.gzhead = null;         /* gzip header information to write */
      this.gzindex = 0;           /* where in extra, name, or comment */
      this.method = Z_DEFLATED$2; /* can only be DEFLATED */
      this.last_flush = -1;   /* value of flush param for previous deflate call */

      this.w_size = 0;  /* LZ77 window size (32K by default) */
      this.w_bits = 0;  /* log2(w_size)  (8..16) */
      this.w_mask = 0;  /* w_size - 1 */

      this.window = null;
      /* Sliding window. Input bytes are read into the second half of the window,
       * and move to the first half later to keep a dictionary of at least wSize
       * bytes. With this organization, matches are limited to a distance of
       * wSize-MAX_MATCH bytes, but this ensures that IO is always
       * performed with a length multiple of the block size.
       */

      this.window_size = 0;
      /* Actual size of window: 2*wSize, except when the user input buffer
       * is directly used as sliding window.
       */

      this.prev = null;
      /* Link to older string with same hash index. To limit the size of this
       * array to 64K, this link is maintained only for the last 32K strings.
       * An index in this array is thus a window index modulo 32K.
       */

      this.head = null;   /* Heads of the hash chains or NIL. */

      this.ins_h = 0;       /* hash index of string to be inserted */
      this.hash_size = 0;   /* number of elements in hash table */
      this.hash_bits = 0;   /* log2(hash_size) */
      this.hash_mask = 0;   /* hash_size-1 */

      this.hash_shift = 0;
      /* Number of bits by which ins_h must be shifted at each input
       * step. It must be such that after MIN_MATCH steps, the oldest
       * byte no longer takes part in the hash key, that is:
       *   hash_shift * MIN_MATCH >= hash_bits
       */

      this.block_start = 0;
      /* Window position at the beginning of the current output block. Gets
       * negative when the window is moved backwards.
       */

      this.match_length = 0;      /* length of best match */
      this.prev_match = 0;        /* previous match */
      this.match_available = 0;   /* set if previous match exists */
      this.strstart = 0;          /* start of string to insert */
      this.match_start = 0;       /* start of matching string */
      this.lookahead = 0;         /* number of valid bytes ahead in window */

      this.prev_length = 0;
      /* Length of the best match at previous step. Matches not greater than this
       * are discarded. This is used in the lazy match evaluation.
       */

      this.max_chain_length = 0;
      /* To speed up deflation, hash chains are never searched beyond this
       * length.  A higher limit improves compression ratio but degrades the
       * speed.
       */

      this.max_lazy_match = 0;
      /* Attempt to find a better match only when the current match is strictly
       * smaller than this value. This mechanism is used only for compression
       * levels >= 4.
       */
      // That's alias to max_lazy_match, don't use directly
      //this.max_insert_length = 0;
      /* Insert new strings in the hash table only if the match length is not
       * greater than this length. This saves time but degrades compression.
       * max_insert_length is used only for compression levels <= 3.
       */

      this.level = 0;     /* compression level (1..9) */
      this.strategy = 0;  /* favor or force Huffman coding*/

      this.good_match = 0;
      /* Use a faster search when the previous match is longer than this */

      this.nice_match = 0; /* Stop searching when current match exceeds this */

                  /* used by trees.c: */

      /* Didn't use ct_data typedef below to suppress compiler warning */

      // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
      // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
      // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

      // Use flat array of DOUBLE size, with interleaved fata,
      // because JS does not support effective
      this.dyn_ltree  = new Uint16Array(HEAP_SIZE * 2);
      this.dyn_dtree  = new Uint16Array((2 * D_CODES + 1) * 2);
      this.bl_tree    = new Uint16Array((2 * BL_CODES + 1) * 2);
      zero(this.dyn_ltree);
      zero(this.dyn_dtree);
      zero(this.bl_tree);

      this.l_desc   = null;         /* desc. for literal tree */
      this.d_desc   = null;         /* desc. for distance tree */
      this.bl_desc  = null;         /* desc. for bit length tree */

      //ush bl_count[MAX_BITS+1];
      this.bl_count = new Uint16Array(MAX_BITS + 1);
      /* number of codes at each bit length for an optimal tree */

      //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
      this.heap = new Uint16Array(2 * L_CODES + 1);  /* heap used to build the Huffman trees */
      zero(this.heap);

      this.heap_len = 0;               /* number of elements in the heap */
      this.heap_max = 0;               /* element of largest frequency */
      /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
       * The same heap array is used to build all trees.
       */

      this.depth = new Uint16Array(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
      zero(this.depth);
      /* Depth of each subtree used as tie breaker for trees of equal frequency
       */

      this.sym_buf = 0;        /* buffer for distances and literals/lengths */

      this.lit_bufsize = 0;
      /* Size of match buffer for literals/lengths.  There are 4 reasons for
       * limiting lit_bufsize to 64K:
       *   - frequencies can be kept in 16 bit counters
       *   - if compression is not successful for the first block, all input
       *     data is still in the window so we can still emit a stored block even
       *     when input comes from standard input.  (This can also be done for
       *     all blocks if lit_bufsize is not greater than 32K.)
       *   - if compression is not successful for a file smaller than 64K, we can
       *     even emit a stored file instead of a stored block (saving 5 bytes).
       *     This is applicable only for zip (not gzip or zlib).
       *   - creating new Huffman trees less frequently may not provide fast
       *     adaptation to changes in the input data statistics. (Take for
       *     example a binary file with poorly compressible code followed by
       *     a highly compressible string table.) Smaller buffer sizes give
       *     fast adaptation but have of course the overhead of transmitting
       *     trees more frequently.
       *   - I can't count above 4
       */

      this.sym_next = 0;      /* running index in sym_buf */
      this.sym_end = 0;       /* symbol table full when sym_next reaches this */

      this.opt_len = 0;       /* bit length of current block with optimal trees */
      this.static_len = 0;    /* bit length of current block with static trees */
      this.matches = 0;       /* number of string matches in current block */
      this.insert = 0;        /* bytes at end of window left to insert */


      this.bi_buf = 0;
      /* Output buffer. bits are inserted starting at the bottom (least
       * significant bits).
       */
      this.bi_valid = 0;
      /* Number of valid bits in bi_buf.  All bits above the last valid bit
       * are always zero.
       */

      // Used for window memory init. We safely ignore it for JS. That makes
      // sense only for pointers and memory check tools.
      //this.high_water = 0;
      /* High water mark offset in window for initialized bytes -- bytes above
       * this are set to zero in order to avoid memory check warnings when
       * longest match routines access bytes past the input.  This is then
       * updated to the new high water mark.
       */
    }


    /* =========================================================================
     * Check for a valid deflate stream state. Return 0 if ok, 1 if not.
     */
    const deflateStateCheck = (strm) => {

      if (!strm) {
        return 1;
      }
      const s = strm.state;
      if (!s || s.strm !== strm || (s.status !== INIT_STATE &&
    //#ifdef GZIP
                                    s.status !== GZIP_STATE &&
    //#endif
                                    s.status !== EXTRA_STATE &&
                                    s.status !== NAME_STATE &&
                                    s.status !== COMMENT_STATE &&
                                    s.status !== HCRC_STATE &&
                                    s.status !== BUSY_STATE &&
                                    s.status !== FINISH_STATE)) {
        return 1;
      }
      return 0;
    };


    const deflateResetKeep = (strm) => {

      if (deflateStateCheck(strm)) {
        return err(strm, Z_STREAM_ERROR$2);
      }

      strm.total_in = strm.total_out = 0;
      strm.data_type = Z_UNKNOWN;

      const s = strm.state;
      s.pending = 0;
      s.pending_out = 0;

      if (s.wrap < 0) {
        s.wrap = -s.wrap;
        /* was made negative by deflate(..., Z_FINISH); */
      }
      s.status =
    //#ifdef GZIP
        s.wrap === 2 ? GZIP_STATE :
    //#endif
        s.wrap ? INIT_STATE : BUSY_STATE;
      strm.adler = (s.wrap === 2) ?
        0  // crc32(0, Z_NULL, 0)
      :
        1; // adler32(0, Z_NULL, 0)
      s.last_flush = -2;
      _tr_init(s);
      return Z_OK$3;
    };


    const deflateReset = (strm) => {

      const ret = deflateResetKeep(strm);
      if (ret === Z_OK$3) {
        lm_init(strm.state);
      }
      return ret;
    };


    const deflateSetHeader = (strm, head) => {

      if (deflateStateCheck(strm) || strm.state.wrap !== 2) {
        return Z_STREAM_ERROR$2;
      }
      strm.state.gzhead = head;
      return Z_OK$3;
    };


    const deflateInit2 = (strm, level, method, windowBits, memLevel, strategy) => {

      if (!strm) { // === Z_NULL
        return Z_STREAM_ERROR$2;
      }
      let wrap = 1;

      if (level === Z_DEFAULT_COMPRESSION$1) {
        level = 6;
      }

      if (windowBits < 0) { /* suppress zlib wrapper */
        wrap = 0;
        windowBits = -windowBits;
      }

      else if (windowBits > 15) {
        wrap = 2;           /* write gzip wrapper instead */
        windowBits -= 16;
      }


      if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED$2 ||
        windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
        strategy < 0 || strategy > Z_FIXED || (windowBits === 8 && wrap !== 1)) {
        return err(strm, Z_STREAM_ERROR$2);
      }


      if (windowBits === 8) {
        windowBits = 9;
      }
      /* until 256-byte window bug fixed */

      const s = new DeflateState();

      strm.state = s;
      s.strm = strm;
      s.status = INIT_STATE;     /* to pass state test in deflateReset() */

      s.wrap = wrap;
      s.gzhead = null;
      s.w_bits = windowBits;
      s.w_size = 1 << s.w_bits;
      s.w_mask = s.w_size - 1;

      s.hash_bits = memLevel + 7;
      s.hash_size = 1 << s.hash_bits;
      s.hash_mask = s.hash_size - 1;
      s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

      s.window = new Uint8Array(s.w_size * 2);
      s.head = new Uint16Array(s.hash_size);
      s.prev = new Uint16Array(s.w_size);

      // Don't need mem init magic for JS.
      //s.high_water = 0;  /* nothing written to s->window yet */

      s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

      /* We overlay pending_buf and sym_buf. This works since the average size
       * for length/distance pairs over any compressed block is assured to be 31
       * bits or less.
       *
       * Analysis: The longest fixed codes are a length code of 8 bits plus 5
       * extra bits, for lengths 131 to 257. The longest fixed distance codes are
       * 5 bits plus 13 extra bits, for distances 16385 to 32768. The longest
       * possible fixed-codes length/distance pair is then 31 bits total.
       *
       * sym_buf starts one-fourth of the way into pending_buf. So there are
       * three bytes in sym_buf for every four bytes in pending_buf. Each symbol
       * in sym_buf is three bytes -- two for the distance and one for the
       * literal/length. As each symbol is consumed, the pointer to the next
       * sym_buf value to read moves forward three bytes. From that symbol, up to
       * 31 bits are written to pending_buf. The closest the written pending_buf
       * bits gets to the next sym_buf symbol to read is just before the last
       * code is written. At that time, 31*(n-2) bits have been written, just
       * after 24*(n-2) bits have been consumed from sym_buf. sym_buf starts at
       * 8*n bits into pending_buf. (Note that the symbol buffer fills when n-1
       * symbols are written.) The closest the writing gets to what is unread is
       * then n+14 bits. Here n is lit_bufsize, which is 16384 by default, and
       * can range from 128 to 32768.
       *
       * Therefore, at a minimum, there are 142 bits of space between what is
       * written and what is read in the overlain buffers, so the symbols cannot
       * be overwritten by the compressed data. That space is actually 139 bits,
       * due to the three-bit fixed-code block header.
       *
       * That covers the case where either Z_FIXED is specified, forcing fixed
       * codes, or when the use of fixed codes is chosen, because that choice
       * results in a smaller compressed block than dynamic codes. That latter
       * condition then assures that the above analysis also covers all dynamic
       * blocks. A dynamic-code block will only be chosen to be emitted if it has
       * fewer bits than a fixed-code block would for the same set of symbols.
       * Therefore its average symbol length is assured to be less than 31. So
       * the compressed data for a dynamic block also cannot overwrite the
       * symbols from which it is being constructed.
       */

      s.pending_buf_size = s.lit_bufsize * 4;
      s.pending_buf = new Uint8Array(s.pending_buf_size);

      // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
      //s->sym_buf = s->pending_buf + s->lit_bufsize;
      s.sym_buf = s.lit_bufsize;

      //s->sym_end = (s->lit_bufsize - 1) * 3;
      s.sym_end = (s.lit_bufsize - 1) * 3;
      /* We avoid equality with lit_bufsize*3 because of wraparound at 64K
       * on 16 bit machines and because stored blocks are restricted to
       * 64K-1 bytes.
       */

      s.level = level;
      s.strategy = strategy;
      s.method = method;

      return deflateReset(strm);
    };

    const deflateInit = (strm, level) => {

      return deflateInit2(strm, level, Z_DEFLATED$2, MAX_WBITS$1, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY$1);
    };


    /* ========================================================================= */
    const deflate$2 = (strm, flush) => {

      if (deflateStateCheck(strm) || flush > Z_BLOCK$1 || flush < 0) {
        return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
      }

      const s = strm.state;

      if (!strm.output ||
          (strm.avail_in !== 0 && !strm.input) ||
          (s.status === FINISH_STATE && flush !== Z_FINISH$3)) {
        return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR$1 : Z_STREAM_ERROR$2);
      }

      const old_flush = s.last_flush;
      s.last_flush = flush;

      /* Flush as much pending output as possible */
      if (s.pending !== 0) {
        flush_pending(strm);
        if (strm.avail_out === 0) {
          /* Since avail_out is 0, deflate will be called again with
           * more output space, but possibly with both pending and
           * avail_in equal to zero. There won't be anything to do,
           * but this is not an error situation so make sure we
           * return OK instead of BUF_ERROR at next call of deflate:
           */
          s.last_flush = -1;
          return Z_OK$3;
        }

        /* Make sure there is something to do and avoid duplicate consecutive
         * flushes. For repeated and useless calls with Z_FINISH, we keep
         * returning Z_STREAM_END instead of Z_BUF_ERROR.
         */
      } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
        flush !== Z_FINISH$3) {
        return err(strm, Z_BUF_ERROR$1);
      }

      /* User must not provide more input after the first FINISH: */
      if (s.status === FINISH_STATE && strm.avail_in !== 0) {
        return err(strm, Z_BUF_ERROR$1);
      }

      /* Write the header */
      if (s.status === INIT_STATE && s.wrap === 0) {
        s.status = BUSY_STATE;
      }
      if (s.status === INIT_STATE) {
        /* zlib header */
        let header = (Z_DEFLATED$2 + ((s.w_bits - 8) << 4)) << 8;
        let level_flags = -1;

        if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
          level_flags = 0;
        } else if (s.level < 6) {
          level_flags = 1;
        } else if (s.level === 6) {
          level_flags = 2;
        } else {
          level_flags = 3;
        }
        header |= (level_flags << 6);
        if (s.strstart !== 0) { header |= PRESET_DICT; }
        header += 31 - (header % 31);

        putShortMSB(s, header);

        /* Save the adler32 of the preset dictionary: */
        if (s.strstart !== 0) {
          putShortMSB(s, strm.adler >>> 16);
          putShortMSB(s, strm.adler & 0xffff);
        }
        strm.adler = 1; // adler32(0L, Z_NULL, 0);
        s.status = BUSY_STATE;

        /* Compression must start with an empty pending buffer */
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
      }
    //#ifdef GZIP
      if (s.status === GZIP_STATE) {
        /* gzip header */
        strm.adler = 0;  //crc32(0L, Z_NULL, 0);
        put_byte(s, 31);
        put_byte(s, 139);
        put_byte(s, 8);
        if (!s.gzhead) { // s->gzhead == Z_NULL
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, s.level === 9 ? 2 :
                      (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                       4 : 0));
          put_byte(s, OS_CODE);
          s.status = BUSY_STATE;

          /* Compression must start with an empty pending buffer */
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
        }
        else {
          put_byte(s, (s.gzhead.text ? 1 : 0) +
                      (s.gzhead.hcrc ? 2 : 0) +
                      (!s.gzhead.extra ? 0 : 4) +
                      (!s.gzhead.name ? 0 : 8) +
                      (!s.gzhead.comment ? 0 : 16)
          );
          put_byte(s, s.gzhead.time & 0xff);
          put_byte(s, (s.gzhead.time >> 8) & 0xff);
          put_byte(s, (s.gzhead.time >> 16) & 0xff);
          put_byte(s, (s.gzhead.time >> 24) & 0xff);
          put_byte(s, s.level === 9 ? 2 :
                      (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                       4 : 0));
          put_byte(s, s.gzhead.os & 0xff);
          if (s.gzhead.extra && s.gzhead.extra.length) {
            put_byte(s, s.gzhead.extra.length & 0xff);
            put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
          }
          if (s.gzhead.hcrc) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
          }
          s.gzindex = 0;
          s.status = EXTRA_STATE;
        }
      }
      if (s.status === EXTRA_STATE) {
        if (s.gzhead.extra/* != Z_NULL*/) {
          let beg = s.pending;   /* start of bytes to update crc */
          let left = (s.gzhead.extra.length & 0xffff) - s.gzindex;
          while (s.pending + left > s.pending_buf_size) {
            let copy = s.pending_buf_size - s.pending;
            // zmemcpy(s.pending_buf + s.pending,
            //    s.gzhead.extra + s.gzindex, copy);
            s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
            s.pending = s.pending_buf_size;
            //--- HCRC_UPDATE(beg) ---//
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            //---//
            s.gzindex += copy;
            flush_pending(strm);
            if (s.pending !== 0) {
              s.last_flush = -1;
              return Z_OK$3;
            }
            beg = 0;
            left -= copy;
          }
          // JS specific: s.gzhead.extra may be TypedArray or Array for backward compatibility
          //              TypedArray.slice and TypedArray.from don't exist in IE10-IE11
          let gzhead_extra = new Uint8Array(s.gzhead.extra);
          // zmemcpy(s->pending_buf + s->pending,
          //     s->gzhead->extra + s->gzindex, left);
          s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
          s.pending += left;
          //--- HCRC_UPDATE(beg) ---//
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          //---//
          s.gzindex = 0;
        }
        s.status = NAME_STATE;
      }
      if (s.status === NAME_STATE) {
        if (s.gzhead.name/* != Z_NULL*/) {
          let beg = s.pending;   /* start of bytes to update crc */
          let val;
          do {
            if (s.pending === s.pending_buf_size) {
              //--- HCRC_UPDATE(beg) ---//
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              //---//
              flush_pending(strm);
              if (s.pending !== 0) {
                s.last_flush = -1;
                return Z_OK$3;
              }
              beg = 0;
            }
            // JS specific: little magic to add zero terminator to end of string
            if (s.gzindex < s.gzhead.name.length) {
              val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
            } else {
              val = 0;
            }
            put_byte(s, val);
          } while (val !== 0);
          //--- HCRC_UPDATE(beg) ---//
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          //---//
          s.gzindex = 0;
        }
        s.status = COMMENT_STATE;
      }
      if (s.status === COMMENT_STATE) {
        if (s.gzhead.comment/* != Z_NULL*/) {
          let beg = s.pending;   /* start of bytes to update crc */
          let val;
          do {
            if (s.pending === s.pending_buf_size) {
              //--- HCRC_UPDATE(beg) ---//
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              //---//
              flush_pending(strm);
              if (s.pending !== 0) {
                s.last_flush = -1;
                return Z_OK$3;
              }
              beg = 0;
            }
            // JS specific: little magic to add zero terminator to end of string
            if (s.gzindex < s.gzhead.comment.length) {
              val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
            } else {
              val = 0;
            }
            put_byte(s, val);
          } while (val !== 0);
          //--- HCRC_UPDATE(beg) ---//
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          //---//
        }
        s.status = HCRC_STATE;
      }
      if (s.status === HCRC_STATE) {
        if (s.gzhead.hcrc) {
          if (s.pending + 2 > s.pending_buf_size) {
            flush_pending(strm);
            if (s.pending !== 0) {
              s.last_flush = -1;
              return Z_OK$3;
            }
          }
          put_byte(s, strm.adler & 0xff);
          put_byte(s, (strm.adler >> 8) & 0xff);
          strm.adler = 0; //crc32(0L, Z_NULL, 0);
        }
        s.status = BUSY_STATE;

        /* Compression must start with an empty pending buffer */
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
      }
    //#endif

      /* Start a new block or continue the current one.
       */
      if (strm.avail_in !== 0 || s.lookahead !== 0 ||
        (flush !== Z_NO_FLUSH$2 && s.status !== FINISH_STATE)) {
        let bstate = s.level === 0 ? deflate_stored(s, flush) :
                     s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) :
                     s.strategy === Z_RLE ? deflate_rle(s, flush) :
                     configuration_table[s.level].func(s, flush);

        if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
          s.status = FINISH_STATE;
        }
        if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            /* avoid BUF_ERROR next call, see above */
          }
          return Z_OK$3;
          /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
           * of deflate should use the same flush parameter to make sure
           * that the flush is complete. So we don't have to output an
           * empty block here, this will be done at next call. This also
           * ensures that for a very small output buffer, we emit at most
           * one empty block.
           */
        }
        if (bstate === BS_BLOCK_DONE) {
          if (flush === Z_PARTIAL_FLUSH) {
            _tr_align(s);
          }
          else if (flush !== Z_BLOCK$1) { /* FULL_FLUSH or SYNC_FLUSH */

            _tr_stored_block(s, 0, 0, false);
            /* For a full flush, this empty block will be recognized
             * as a special marker by inflate_sync().
             */
            if (flush === Z_FULL_FLUSH$1) {
              /*** CLEAR_HASH(s); ***/             /* forget history */
              zero(s.head); // Fill with NIL (= 0);

              if (s.lookahead === 0) {
                s.strstart = 0;
                s.block_start = 0;
                s.insert = 0;
              }
            }
          }
          flush_pending(strm);
          if (strm.avail_out === 0) {
            s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
            return Z_OK$3;
          }
        }
      }

      if (flush !== Z_FINISH$3) { return Z_OK$3; }
      if (s.wrap <= 0) { return Z_STREAM_END$3; }

      /* Write the trailer */
      if (s.wrap === 2) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, (strm.adler >> 8) & 0xff);
        put_byte(s, (strm.adler >> 16) & 0xff);
        put_byte(s, (strm.adler >> 24) & 0xff);
        put_byte(s, strm.total_in & 0xff);
        put_byte(s, (strm.total_in >> 8) & 0xff);
        put_byte(s, (strm.total_in >> 16) & 0xff);
        put_byte(s, (strm.total_in >> 24) & 0xff);
      }
      else
      {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 0xffff);
      }

      flush_pending(strm);
      /* If avail_out is zero, the application will call deflate again
       * to flush the rest.
       */
      if (s.wrap > 0) { s.wrap = -s.wrap; }
      /* write the trailer only once! */
      return s.pending !== 0 ? Z_OK$3 : Z_STREAM_END$3;
    };


    const deflateEnd = (strm) => {

      if (deflateStateCheck(strm)) {
        return Z_STREAM_ERROR$2;
      }

      const status = strm.state.status;

      strm.state = null;

      return status === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$3;
    };


    /* =========================================================================
     * Initializes the compression dictionary from the given byte
     * sequence without producing any compressed output.
     */
    const deflateSetDictionary = (strm, dictionary) => {

      let dictLength = dictionary.length;

      if (deflateStateCheck(strm)) {
        return Z_STREAM_ERROR$2;
      }

      const s = strm.state;
      const wrap = s.wrap;

      if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
        return Z_STREAM_ERROR$2;
      }

      /* when using zlib wrappers, compute Adler-32 for provided dictionary */
      if (wrap === 1) {
        /* adler32(strm->adler, dictionary, dictLength); */
        strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
      }

      s.wrap = 0;   /* avoid computing Adler-32 in read_buf */

      /* if dictionary would fill window, just replace the history */
      if (dictLength >= s.w_size) {
        if (wrap === 0) {            /* already empty otherwise */
          /*** CLEAR_HASH(s); ***/
          zero(s.head); // Fill with NIL (= 0);
          s.strstart = 0;
          s.block_start = 0;
          s.insert = 0;
        }
        /* use the tail */
        // dictionary = dictionary.slice(dictLength - s.w_size);
        let tmpDict = new Uint8Array(s.w_size);
        tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
        dictionary = tmpDict;
        dictLength = s.w_size;
      }
      /* insert dictionary into window and hash */
      const avail = strm.avail_in;
      const next = strm.next_in;
      const input = strm.input;
      strm.avail_in = dictLength;
      strm.next_in = 0;
      strm.input = dictionary;
      fill_window(s);
      while (s.lookahead >= MIN_MATCH) {
        let str = s.strstart;
        let n = s.lookahead - (MIN_MATCH - 1);
        do {
          /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
          s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);

          s.prev[str & s.w_mask] = s.head[s.ins_h];

          s.head[s.ins_h] = str;
          str++;
        } while (--n);
        s.strstart = str;
        s.lookahead = MIN_MATCH - 1;
        fill_window(s);
      }
      s.strstart += s.lookahead;
      s.block_start = s.strstart;
      s.insert = s.lookahead;
      s.lookahead = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      strm.next_in = next;
      strm.input = input;
      strm.avail_in = avail;
      s.wrap = wrap;
      return Z_OK$3;
    };


    var deflateInit_1 = deflateInit;
    var deflateInit2_1 = deflateInit2;
    var deflateReset_1 = deflateReset;
    var deflateResetKeep_1 = deflateResetKeep;
    var deflateSetHeader_1 = deflateSetHeader;
    var deflate_2$1 = deflate$2;
    var deflateEnd_1 = deflateEnd;
    var deflateSetDictionary_1 = deflateSetDictionary;
    var deflateInfo = 'pako deflate (from Nodeca project)';

    /* Not implemented
    module.exports.deflateBound = deflateBound;
    module.exports.deflateCopy = deflateCopy;
    module.exports.deflateGetDictionary = deflateGetDictionary;
    module.exports.deflateParams = deflateParams;
    module.exports.deflatePending = deflatePending;
    module.exports.deflatePrime = deflatePrime;
    module.exports.deflateTune = deflateTune;
    */

    var deflate_1$2 = {
    	deflateInit: deflateInit_1,
    	deflateInit2: deflateInit2_1,
    	deflateReset: deflateReset_1,
    	deflateResetKeep: deflateResetKeep_1,
    	deflateSetHeader: deflateSetHeader_1,
    	deflate: deflate_2$1,
    	deflateEnd: deflateEnd_1,
    	deflateSetDictionary: deflateSetDictionary_1,
    	deflateInfo: deflateInfo
    };

    const _has = (obj, key) => {
      return Object.prototype.hasOwnProperty.call(obj, key);
    };

    var assign = function (obj /*from1, from2, from3, ...*/) {
      const sources = Array.prototype.slice.call(arguments, 1);
      while (sources.length) {
        const source = sources.shift();
        if (!source) { continue; }

        if (typeof source !== 'object') {
          throw new TypeError(source + 'must be non-object');
        }

        for (const p in source) {
          if (_has(source, p)) {
            obj[p] = source[p];
          }
        }
      }

      return obj;
    };


    // Join array of chunks to single array.
    var flattenChunks = (chunks) => {
      // calculate data length
      let len = 0;

      for (let i = 0, l = chunks.length; i < l; i++) {
        len += chunks[i].length;
      }

      // join chunks
      const result = new Uint8Array(len);

      for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
        let chunk = chunks[i];
        result.set(chunk, pos);
        pos += chunk.length;
      }

      return result;
    };

    var common = {
    	assign: assign,
    	flattenChunks: flattenChunks
    };

    // String encode/decode helpers


    // Quick check if we can use fast array to bin string conversion
    //
    // - apply(Array) can fail on Android 2.2
    // - apply(Uint8Array) can fail on iOS 5.1 Safari
    //
    let STR_APPLY_UIA_OK = true;

    try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


    // Table with utf8 lengths (calculated by first byte of sequence)
    // Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
    // because max possible codepoint is 0x10ffff
    const _utf8len = new Uint8Array(256);
    for (let q = 0; q < 256; q++) {
      _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
    }
    _utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


    // convert string to array (typed, when possible)
    var string2buf = (str) => {
      if (typeof TextEncoder === 'function' && TextEncoder.prototype.encode) {
        return new TextEncoder().encode(str);
      }

      let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

      // count binary size
      for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 0xfc00) === 0xdc00) {
            c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
            m_pos++;
          }
        }
        buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
      }

      // allocate buffer
      buf = new Uint8Array(buf_len);

      // convert
      for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 0xfc00) === 0xdc00) {
            c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
            m_pos++;
          }
        }
        if (c < 0x80) {
          /* one byte */
          buf[i++] = c;
        } else if (c < 0x800) {
          /* two bytes */
          buf[i++] = 0xC0 | (c >>> 6);
          buf[i++] = 0x80 | (c & 0x3f);
        } else if (c < 0x10000) {
          /* three bytes */
          buf[i++] = 0xE0 | (c >>> 12);
          buf[i++] = 0x80 | (c >>> 6 & 0x3f);
          buf[i++] = 0x80 | (c & 0x3f);
        } else {
          /* four bytes */
          buf[i++] = 0xf0 | (c >>> 18);
          buf[i++] = 0x80 | (c >>> 12 & 0x3f);
          buf[i++] = 0x80 | (c >>> 6 & 0x3f);
          buf[i++] = 0x80 | (c & 0x3f);
        }
      }

      return buf;
    };

    // Helper
    const buf2binstring = (buf, len) => {
      // On Chrome, the arguments in a function call that are allowed is `65534`.
      // If the length of the buffer is smaller than that, we can use this optimization,
      // otherwise we will take a slower path.
      if (len < 65534) {
        if (buf.subarray && STR_APPLY_UIA_OK) {
          return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
        }
      }

      let result = '';
      for (let i = 0; i < len; i++) {
        result += String.fromCharCode(buf[i]);
      }
      return result;
    };


    // convert array to string
    var buf2string = (buf, max) => {
      const len = max || buf.length;

      if (typeof TextDecoder === 'function' && TextDecoder.prototype.decode) {
        return new TextDecoder().decode(buf.subarray(0, max));
      }

      let i, out;

      // Reserve max possible length (2 words per char)
      // NB: by unknown reasons, Array is significantly faster for
      //     String.fromCharCode.apply than Uint16Array.
      const utf16buf = new Array(len * 2);

      for (out = 0, i = 0; i < len;) {
        let c = buf[i++];
        // quick process ascii
        if (c < 0x80) { utf16buf[out++] = c; continue; }

        let c_len = _utf8len[c];
        // skip 5 & 6 byte codes
        if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

        // apply mask on first byte
        c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
        // join the rest
        while (c_len > 1 && i < len) {
          c = (c << 6) | (buf[i++] & 0x3f);
          c_len--;
        }

        // terminated by end of string?
        if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

        if (c < 0x10000) {
          utf16buf[out++] = c;
        } else {
          c -= 0x10000;
          utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
          utf16buf[out++] = 0xdc00 | (c & 0x3ff);
        }
      }

      return buf2binstring(utf16buf, out);
    };


    // Calculate max possible position in utf8 buffer,
    // that will not break sequence. If that's not possible
    // - (very small limits) return max size as is.
    //
    // buf[] - utf8 bytes array
    // max   - length limit (mandatory);
    var utf8border = (buf, max) => {

      max = max || buf.length;
      if (max > buf.length) { max = buf.length; }

      // go back from last position, until start of sequence found
      let pos = max - 1;
      while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

      // Very small and broken sequence,
      // return max, because we should return something anyway.
      if (pos < 0) { return max; }

      // If we came to start of buffer - that means buffer is too small,
      // return max too.
      if (pos === 0) { return max; }

      return (pos + _utf8len[buf[pos]] > max) ? pos : max;
    };

    var strings = {
    	string2buf: string2buf,
    	buf2string: buf2string,
    	utf8border: utf8border
    };

    // (C) 1995-2013 Jean-loup Gailly and Mark Adler
    // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
    //
    // This software is provided 'as-is', without any express or implied
    // warranty. In no event will the authors be held liable for any damages
    // arising from the use of this software.
    //
    // Permission is granted to anyone to use this software for any purpose,
    // including commercial applications, and to alter it and redistribute it
    // freely, subject to the following restrictions:
    //
    // 1. The origin of this software must not be misrepresented; you must not
    //   claim that you wrote the original software. If you use this software
    //   in a product, an acknowledgment in the product documentation would be
    //   appreciated but is not required.
    // 2. Altered source versions must be plainly marked as such, and must not be
    //   misrepresented as being the original software.
    // 3. This notice may not be removed or altered from any source distribution.

    function ZStream() {
      /* next input byte */
      this.input = null; // JS specific, because we have no pointers
      this.next_in = 0;
      /* number of bytes available at input */
      this.avail_in = 0;
      /* total number of input bytes read so far */
      this.total_in = 0;
      /* next output byte should be put there */
      this.output = null; // JS specific, because we have no pointers
      this.next_out = 0;
      /* remaining free space at output */
      this.avail_out = 0;
      /* total number of bytes output so far */
      this.total_out = 0;
      /* last error message, NULL if no error */
      this.msg = ''/*Z_NULL*/;
      /* not visible by applications */
      this.state = null;
      /* best guess about the data type: binary or text */
      this.data_type = 2/*Z_UNKNOWN*/;
      /* adler32 value of the uncompressed data */
      this.adler = 0;
    }

    var zstream = ZStream;

    const toString$1 = Object.prototype.toString;

    /* Public constants ==========================================================*/
    /* ===========================================================================*/

    const {
      Z_NO_FLUSH: Z_NO_FLUSH$1, Z_SYNC_FLUSH, Z_FULL_FLUSH, Z_FINISH: Z_FINISH$2,
      Z_OK: Z_OK$2, Z_STREAM_END: Z_STREAM_END$2,
      Z_DEFAULT_COMPRESSION,
      Z_DEFAULT_STRATEGY,
      Z_DEFLATED: Z_DEFLATED$1
    } = constants$2;

    /* ===========================================================================*/


    /**
     * class Deflate
     *
     * Generic JS-style wrapper for zlib calls. If you don't need
     * streaming behaviour - use more simple functions: [[deflate]],
     * [[deflateRaw]] and [[gzip]].
     **/

    /* internal
     * Deflate.chunks -> Array
     *
     * Chunks of output data, if [[Deflate#onData]] not overridden.
     **/

    /**
     * Deflate.result -> Uint8Array
     *
     * Compressed result, generated by default [[Deflate#onData]]
     * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
     * (call [[Deflate#push]] with `Z_FINISH` / `true` param).
     **/

    /**
     * Deflate.err -> Number
     *
     * Error code after deflate finished. 0 (Z_OK) on success.
     * You will not need it in real life, because deflate errors
     * are possible only on wrong options or bad `onData` / `onEnd`
     * custom handlers.
     **/

    /**
     * Deflate.msg -> String
     *
     * Error message, if [[Deflate.err]] != 0
     **/


    /**
     * new Deflate(options)
     * - options (Object): zlib deflate options.
     *
     * Creates new deflator instance with specified params. Throws exception
     * on bad params. Supported options:
     *
     * - `level`
     * - `windowBits`
     * - `memLevel`
     * - `strategy`
     * - `dictionary`
     *
     * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
     * for more information on these.
     *
     * Additional options, for internal needs:
     *
     * - `chunkSize` - size of generated data chunks (16K by default)
     * - `raw` (Boolean) - do raw deflate
     * - `gzip` (Boolean) - create gzip wrapper
     * - `header` (Object) - custom header for gzip
     *   - `text` (Boolean) - true if compressed data believed to be text
     *   - `time` (Number) - modification time, unix timestamp
     *   - `os` (Number) - operation system code
     *   - `extra` (Array) - array of bytes with extra data (max 65536)
     *   - `name` (String) - file name (binary string)
     *   - `comment` (String) - comment (binary string)
     *   - `hcrc` (Boolean) - true if header crc should be added
     *
     * ##### Example:
     *
     * ```javascript
     * const pako = require('pako')
     *   , chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
     *   , chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
     *
     * const deflate = new pako.Deflate({ level: 3});
     *
     * deflate.push(chunk1, false);
     * deflate.push(chunk2, true);  // true -> last chunk
     *
     * if (deflate.err) { throw new Error(deflate.err); }
     *
     * console.log(deflate.result);
     * ```
     **/
    function Deflate$1(options) {
      this.options = common.assign({
        level: Z_DEFAULT_COMPRESSION,
        method: Z_DEFLATED$1,
        chunkSize: 16384,
        windowBits: 15,
        memLevel: 8,
        strategy: Z_DEFAULT_STRATEGY
      }, options || {});

      let opt = this.options;

      if (opt.raw && (opt.windowBits > 0)) {
        opt.windowBits = -opt.windowBits;
      }

      else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
        opt.windowBits += 16;
      }

      this.err    = 0;      // error code, if happens (0 = Z_OK)
      this.msg    = '';     // error message
      this.ended  = false;  // used to avoid multiple onEnd() calls
      this.chunks = [];     // chunks of compressed data

      this.strm = new zstream();
      this.strm.avail_out = 0;

      let status = deflate_1$2.deflateInit2(
        this.strm,
        opt.level,
        opt.method,
        opt.windowBits,
        opt.memLevel,
        opt.strategy
      );

      if (status !== Z_OK$2) {
        throw new Error(messages[status]);
      }

      if (opt.header) {
        deflate_1$2.deflateSetHeader(this.strm, opt.header);
      }

      if (opt.dictionary) {
        let dict;
        // Convert data if needed
        if (typeof opt.dictionary === 'string') {
          // If we need to compress text, change encoding to utf8.
          dict = strings.string2buf(opt.dictionary);
        } else if (toString$1.call(opt.dictionary) === '[object ArrayBuffer]') {
          dict = new Uint8Array(opt.dictionary);
        } else {
          dict = opt.dictionary;
        }

        status = deflate_1$2.deflateSetDictionary(this.strm, dict);

        if (status !== Z_OK$2) {
          throw new Error(messages[status]);
        }

        this._dict_set = true;
      }
    }

    /**
     * Deflate#push(data[, flush_mode]) -> Boolean
     * - data (Uint8Array|ArrayBuffer|String): input data. Strings will be
     *   converted to utf8 byte sequence.
     * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
     *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
     *
     * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
     * new compressed chunks. Returns `true` on success. The last data block must
     * have `flush_mode` Z_FINISH (or `true`). That will flush internal pending
     * buffers and call [[Deflate#onEnd]].
     *
     * On fail call [[Deflate#onEnd]] with error code and return false.
     *
     * ##### Example
     *
     * ```javascript
     * push(chunk, false); // push one of data chunks
     * ...
     * push(chunk, true);  // push last chunk
     * ```
     **/
    Deflate$1.prototype.push = function (data, flush_mode) {
      const strm = this.strm;
      const chunkSize = this.options.chunkSize;
      let status, _flush_mode;

      if (this.ended) { return false; }

      if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
      else _flush_mode = flush_mode === true ? Z_FINISH$2 : Z_NO_FLUSH$1;

      // Convert data if needed
      if (typeof data === 'string') {
        // If we need to compress text, change encoding to utf8.
        strm.input = strings.string2buf(data);
      } else if (toString$1.call(data) === '[object ArrayBuffer]') {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }

      strm.next_in = 0;
      strm.avail_in = strm.input.length;

      for (;;) {
        if (strm.avail_out === 0) {
          strm.output = new Uint8Array(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }

        // Make sure avail_out > 6 to avoid repeating markers
        if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
          this.onData(strm.output.subarray(0, strm.next_out));
          strm.avail_out = 0;
          continue;
        }

        status = deflate_1$2.deflate(strm, _flush_mode);

        // Ended => flush and finish
        if (status === Z_STREAM_END$2) {
          if (strm.next_out > 0) {
            this.onData(strm.output.subarray(0, strm.next_out));
          }
          status = deflate_1$2.deflateEnd(this.strm);
          this.onEnd(status);
          this.ended = true;
          return status === Z_OK$2;
        }

        // Flush if out buffer full
        if (strm.avail_out === 0) {
          this.onData(strm.output);
          continue;
        }

        // Flush if requested and has data
        if (_flush_mode > 0 && strm.next_out > 0) {
          this.onData(strm.output.subarray(0, strm.next_out));
          strm.avail_out = 0;
          continue;
        }

        if (strm.avail_in === 0) break;
      }

      return true;
    };


    /**
     * Deflate#onData(chunk) -> Void
     * - chunk (Uint8Array): output data.
     *
     * By default, stores data blocks in `chunks[]` property and glue
     * those in `onEnd`. Override this handler, if you need another behaviour.
     **/
    Deflate$1.prototype.onData = function (chunk) {
      this.chunks.push(chunk);
    };


    /**
     * Deflate#onEnd(status) -> Void
     * - status (Number): deflate status. 0 (Z_OK) on success,
     *   other if not.
     *
     * Called once after you tell deflate that the input stream is
     * complete (Z_FINISH). By default - join collected chunks,
     * free memory and fill `results` / `err` properties.
     **/
    Deflate$1.prototype.onEnd = function (status) {
      // On success - join
      if (status === Z_OK$2) {
        this.result = common.flattenChunks(this.chunks);
      }
      this.chunks = [];
      this.err = status;
      this.msg = this.strm.msg;
    };


    /**
     * deflate(data[, options]) -> Uint8Array
     * - data (Uint8Array|ArrayBuffer|String): input data to compress.
     * - options (Object): zlib deflate options.
     *
     * Compress `data` with deflate algorithm and `options`.
     *
     * Supported options are:
     *
     * - level
     * - windowBits
     * - memLevel
     * - strategy
     * - dictionary
     *
     * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
     * for more information on these.
     *
     * Sugar (options):
     *
     * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
     *   negative windowBits implicitly.
     *
     * ##### Example:
     *
     * ```javascript
     * const pako = require('pako')
     * const data = new Uint8Array([1,2,3,4,5,6,7,8,9]);
     *
     * console.log(pako.deflate(data));
     * ```
     **/
    function deflate$1(input, options) {
      const deflator = new Deflate$1(options);

      deflator.push(input, true);

      // That will never happens, if you don't cheat with options :)
      if (deflator.err) { throw deflator.msg || messages[deflator.err]; }

      return deflator.result;
    }


    /**
     * deflateRaw(data[, options]) -> Uint8Array
     * - data (Uint8Array|ArrayBuffer|String): input data to compress.
     * - options (Object): zlib deflate options.
     *
     * The same as [[deflate]], but creates raw data, without wrapper
     * (header and adler32 crc).
     **/
    function deflateRaw$1(input, options) {
      options = options || {};
      options.raw = true;
      return deflate$1(input, options);
    }


    /**
     * gzip(data[, options]) -> Uint8Array
     * - data (Uint8Array|ArrayBuffer|String): input data to compress.
     * - options (Object): zlib deflate options.
     *
     * The same as [[deflate]], but create gzip wrapper instead of
     * deflate one.
     **/
    function gzip$1(input, options) {
      options = options || {};
      options.gzip = true;
      return deflate$1(input, options);
    }


    var Deflate_1$1 = Deflate$1;
    var deflate_2 = deflate$1;
    var deflateRaw_1$1 = deflateRaw$1;
    var gzip_1$1 = gzip$1;
    var constants$1 = constants$2;

    var deflate_1$1 = {
    	Deflate: Deflate_1$1,
    	deflate: deflate_2,
    	deflateRaw: deflateRaw_1$1,
    	gzip: gzip_1$1,
    	constants: constants$1
    };

    // (C) 1995-2013 Jean-loup Gailly and Mark Adler
    // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
    //
    // This software is provided 'as-is', without any express or implied
    // warranty. In no event will the authors be held liable for any damages
    // arising from the use of this software.
    //
    // Permission is granted to anyone to use this software for any purpose,
    // including commercial applications, and to alter it and redistribute it
    // freely, subject to the following restrictions:
    //
    // 1. The origin of this software must not be misrepresented; you must not
    //   claim that you wrote the original software. If you use this software
    //   in a product, an acknowledgment in the product documentation would be
    //   appreciated but is not required.
    // 2. Altered source versions must be plainly marked as such, and must not be
    //   misrepresented as being the original software.
    // 3. This notice may not be removed or altered from any source distribution.

    // See state defs from inflate.js
    const BAD$1 = 16209;       /* got a data error -- remain here until reset */
    const TYPE$1 = 16191;      /* i: waiting for type bits, including last-flag bit */

    /*
       Decode literal, length, and distance codes and write out the resulting
       literal and match bytes until either not enough input or output is
       available, an end-of-block is encountered, or a data error is encountered.
       When large enough input and output buffers are supplied to inflate(), for
       example, a 16K input buffer and a 64K output buffer, more than 95% of the
       inflate execution time is spent in this routine.

       Entry assumptions:

            state.mode === LEN
            strm.avail_in >= 6
            strm.avail_out >= 258
            start >= strm.avail_out
            state.bits < 8

       On return, state.mode is one of:

            LEN -- ran out of enough output space or enough available input
            TYPE -- reached end of block code, inflate() to interpret next block
            BAD -- error in block data

       Notes:

        - The maximum input bits used by a length/distance pair is 15 bits for the
          length code, 5 bits for the length extra, 15 bits for the distance code,
          and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
          Therefore if strm.avail_in >= 6, then there is enough input to avoid
          checking for available input while decoding.

        - The maximum bytes that a single length/distance pair can output is 258
          bytes, which is the maximum length that can be coded.  inflate_fast()
          requires strm.avail_out >= 258 for each loop to avoid checking for
          output space.
     */
    var inffast = function inflate_fast(strm, start) {
      let _in;                    /* local strm.input */
      let last;                   /* have enough input while in < last */
      let _out;                   /* local strm.output */
      let beg;                    /* inflate()'s initial strm.output */
      let end;                    /* while out < end, enough space available */
    //#ifdef INFLATE_STRICT
      let dmax;                   /* maximum distance from zlib header */
    //#endif
      let wsize;                  /* window size or zero if not using window */
      let whave;                  /* valid bytes in the window */
      let wnext;                  /* window write index */
      // Use `s_window` instead `window`, avoid conflict with instrumentation tools
      let s_window;               /* allocated sliding window, if wsize != 0 */
      let hold;                   /* local strm.hold */
      let bits;                   /* local strm.bits */
      let lcode;                  /* local strm.lencode */
      let dcode;                  /* local strm.distcode */
      let lmask;                  /* mask for first level of length codes */
      let dmask;                  /* mask for first level of distance codes */
      let here;                   /* retrieved table entry */
      let op;                     /* code bits, operation, extra bits, or */
                                  /*  window position, window bytes to copy */
      let len;                    /* match length, unused bytes */
      let dist;                   /* match distance */
      let from;                   /* where to copy match from */
      let from_source;


      let input, output; // JS specific, because we have no pointers

      /* copy state to local variables */
      const state = strm.state;
      //here = state.here;
      _in = strm.next_in;
      input = strm.input;
      last = _in + (strm.avail_in - 5);
      _out = strm.next_out;
      output = strm.output;
      beg = _out - (start - strm.avail_out);
      end = _out + (strm.avail_out - 257);
    //#ifdef INFLATE_STRICT
      dmax = state.dmax;
    //#endif
      wsize = state.wsize;
      whave = state.whave;
      wnext = state.wnext;
      s_window = state.window;
      hold = state.hold;
      bits = state.bits;
      lcode = state.lencode;
      dcode = state.distcode;
      lmask = (1 << state.lenbits) - 1;
      dmask = (1 << state.distbits) - 1;


      /* decode literals and length/distances until end-of-block or not enough
         input data or output space */

      top:
      do {
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }

        here = lcode[hold & lmask];

        dolen:
        for (;;) { // Goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;
          if (op === 0) {                          /* literal */
            //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
            //        "inflate:         literal '%c'\n" :
            //        "inflate:         literal 0x%02x\n", here.val));
            output[_out++] = here & 0xffff/*here.val*/;
          }
          else if (op & 16) {                     /* length base */
            len = here & 0xffff/*here.val*/;
            op &= 15;                           /* number of extra bits */
            if (op) {
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
              len += hold & ((1 << op) - 1);
              hold >>>= op;
              bits -= op;
            }
            //Tracevv((stderr, "inflate:         length %u\n", len));
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = dcode[hold & dmask];

            dodist:
            for (;;) { // goto emulation
              op = here >>> 24/*here.bits*/;
              hold >>>= op;
              bits -= op;
              op = (here >>> 16) & 0xff/*here.op*/;

              if (op & 16) {                      /* distance base */
                dist = here & 0xffff/*here.val*/;
                op &= 15;                       /* number of extra bits */
                if (bits < op) {
                  hold += input[_in++] << bits;
                  bits += 8;
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                }
                dist += hold & ((1 << op) - 1);
    //#ifdef INFLATE_STRICT
                if (dist > dmax) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD$1;
                  break top;
                }
    //#endif
                hold >>>= op;
                bits -= op;
                //Tracevv((stderr, "inflate:         distance %u\n", dist));
                op = _out - beg;                /* max distance in output */
                if (dist > op) {                /* see if copy from window */
                  op = dist - op;               /* distance back in window */
                  if (op > whave) {
                    if (state.sane) {
                      strm.msg = 'invalid distance too far back';
                      state.mode = BAD$1;
                      break top;
                    }

    // (!) This block is disabled in zlib defaults,
    // don't enable it for binary compatibility
    //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
    //                if (len <= op - whave) {
    //                  do {
    //                    output[_out++] = 0;
    //                  } while (--len);
    //                  continue top;
    //                }
    //                len -= op - whave;
    //                do {
    //                  output[_out++] = 0;
    //                } while (--op > whave);
    //                if (op === 0) {
    //                  from = _out - dist;
    //                  do {
    //                    output[_out++] = output[from++];
    //                  } while (--len);
    //                  continue top;
    //                }
    //#endif
                  }
                  from = 0; // window index
                  from_source = s_window;
                  if (wnext === 0) {           /* very common case */
                    from += wsize - op;
                    if (op < len) {         /* some from window */
                      len -= op;
                      do {
                        output[_out++] = s_window[from++];
                      } while (--op);
                      from = _out - dist;  /* rest from output */
                      from_source = output;
                    }
                  }
                  else if (wnext < op) {      /* wrap around window */
                    from += wsize + wnext - op;
                    op -= wnext;
                    if (op < len) {         /* some from end of window */
                      len -= op;
                      do {
                        output[_out++] = s_window[from++];
                      } while (--op);
                      from = 0;
                      if (wnext < len) {  /* some from start of window */
                        op = wnext;
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = _out - dist;      /* rest from output */
                        from_source = output;
                      }
                    }
                  }
                  else {                      /* contiguous in window */
                    from += wnext - op;
                    if (op < len) {         /* some from window */
                      len -= op;
                      do {
                        output[_out++] = s_window[from++];
                      } while (--op);
                      from = _out - dist;  /* rest from output */
                      from_source = output;
                    }
                  }
                  while (len > 2) {
                    output[_out++] = from_source[from++];
                    output[_out++] = from_source[from++];
                    output[_out++] = from_source[from++];
                    len -= 3;
                  }
                  if (len) {
                    output[_out++] = from_source[from++];
                    if (len > 1) {
                      output[_out++] = from_source[from++];
                    }
                  }
                }
                else {
                  from = _out - dist;          /* copy direct from output */
                  do {                        /* minimum length is three */
                    output[_out++] = output[from++];
                    output[_out++] = output[from++];
                    output[_out++] = output[from++];
                    len -= 3;
                  } while (len > 2);
                  if (len) {
                    output[_out++] = output[from++];
                    if (len > 1) {
                      output[_out++] = output[from++];
                    }
                  }
                }
              }
              else if ((op & 64) === 0) {          /* 2nd level distance code */
                here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
                continue dodist;
              }
              else {
                strm.msg = 'invalid distance code';
                state.mode = BAD$1;
                break top;
              }

              break; // need to emulate goto via "continue"
            }
          }
          else if ((op & 64) === 0) {              /* 2nd level length code */
            here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dolen;
          }
          else if (op & 32) {                     /* end-of-block */
            //Tracevv((stderr, "inflate:         end of block\n"));
            state.mode = TYPE$1;
            break top;
          }
          else {
            strm.msg = 'invalid literal/length code';
            state.mode = BAD$1;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      } while (_in < last && _out < end);

      /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
      len = bits >> 3;
      _in -= len;
      bits -= len << 3;
      hold &= (1 << bits) - 1;

      /* update state and return */
      strm.next_in = _in;
      strm.next_out = _out;
      strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
      strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
      state.hold = hold;
      state.bits = bits;
      return;
    };

    // (C) 1995-2013 Jean-loup Gailly and Mark Adler
    // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
    //
    // This software is provided 'as-is', without any express or implied
    // warranty. In no event will the authors be held liable for any damages
    // arising from the use of this software.
    //
    // Permission is granted to anyone to use this software for any purpose,
    // including commercial applications, and to alter it and redistribute it
    // freely, subject to the following restrictions:
    //
    // 1. The origin of this software must not be misrepresented; you must not
    //   claim that you wrote the original software. If you use this software
    //   in a product, an acknowledgment in the product documentation would be
    //   appreciated but is not required.
    // 2. Altered source versions must be plainly marked as such, and must not be
    //   misrepresented as being the original software.
    // 3. This notice may not be removed or altered from any source distribution.

    const MAXBITS = 15;
    const ENOUGH_LENS$1 = 852;
    const ENOUGH_DISTS$1 = 592;
    //const ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

    const CODES$1 = 0;
    const LENS$1 = 1;
    const DISTS$1 = 2;

    const lbase = new Uint16Array([ /* Length codes 257..285 base */
      3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
      35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
    ]);

    const lext = new Uint8Array([ /* Length codes 257..285 extra */
      16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
      19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
    ]);

    const dbase = new Uint16Array([ /* Distance codes 0..29 base */
      1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
      257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
      8193, 12289, 16385, 24577, 0, 0
    ]);

    const dext = new Uint8Array([ /* Distance codes 0..29 extra */
      16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
      23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
      28, 28, 29, 29, 64, 64
    ]);

    const inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) =>
    {
      const bits = opts.bits;
          //here = opts.here; /* table entry for duplication */

      let len = 0;               /* a code's length in bits */
      let sym = 0;               /* index of code symbols */
      let min = 0, max = 0;          /* minimum and maximum code lengths */
      let root = 0;              /* number of index bits for root table */
      let curr = 0;              /* number of index bits for current table */
      let drop = 0;              /* code bits to drop for sub-table */
      let left = 0;                   /* number of prefix codes available */
      let used = 0;              /* code entries in table used */
      let huff = 0;              /* Huffman code */
      let incr;              /* for incrementing code, index */
      let fill;              /* index for replicating entries */
      let low;               /* low bits for current root entry */
      let mask;              /* mask for low root bits */
      let next;             /* next available space in table */
      let base = null;     /* base value table to use */
    //  let shoextra;    /* extra bits table to use */
      let match;                  /* use base and extra for symbol >= match */
      const count = new Uint16Array(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
      const offs = new Uint16Array(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
      let extra = null;

      let here_bits, here_op, here_val;

      /*
       Process a set of code lengths to create a canonical Huffman code.  The
       code lengths are lens[0..codes-1].  Each length corresponds to the
       symbols 0..codes-1.  The Huffman code is generated by first sorting the
       symbols by length from short to long, and retaining the symbol order
       for codes with equal lengths.  Then the code starts with all zero bits
       for the first code of the shortest length, and the codes are integer
       increments for the same length, and zeros are appended as the length
       increases.  For the deflate format, these bits are stored backwards
       from their more natural integer increment ordering, and so when the
       decoding tables are built in the large loop below, the integer codes
       are incremented backwards.

       This routine assumes, but does not check, that all of the entries in
       lens[] are in the range 0..MAXBITS.  The caller must assure this.
       1..MAXBITS is interpreted as that code length.  zero means that that
       symbol does not occur in this code.

       The codes are sorted by computing a count of codes for each length,
       creating from that a table of starting indices for each length in the
       sorted table, and then entering the symbols in order in the sorted
       table.  The sorted table is work[], with that space being provided by
       the caller.

       The length counts are used for other purposes as well, i.e. finding
       the minimum and maximum length codes, determining if there are any
       codes at all, checking for a valid set of lengths, and looking ahead
       at length counts to determine sub-table sizes when building the
       decoding tables.
       */

      /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
      for (len = 0; len <= MAXBITS; len++) {
        count[len] = 0;
      }
      for (sym = 0; sym < codes; sym++) {
        count[lens[lens_index + sym]]++;
      }

      /* bound code lengths, force root to be within code lengths */
      root = bits;
      for (max = MAXBITS; max >= 1; max--) {
        if (count[max] !== 0) { break; }
      }
      if (root > max) {
        root = max;
      }
      if (max === 0) {                     /* no symbols to code at all */
        //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
        //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
        //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
        table[table_index++] = (1 << 24) | (64 << 16) | 0;


        //table.op[opts.table_index] = 64;
        //table.bits[opts.table_index] = 1;
        //table.val[opts.table_index++] = 0;
        table[table_index++] = (1 << 24) | (64 << 16) | 0;

        opts.bits = 1;
        return 0;     /* no symbols, but wait for decoding to report error */
      }
      for (min = 1; min < max; min++) {
        if (count[min] !== 0) { break; }
      }
      if (root < min) {
        root = min;
      }

      /* check for an over-subscribed or incomplete set of lengths */
      left = 1;
      for (len = 1; len <= MAXBITS; len++) {
        left <<= 1;
        left -= count[len];
        if (left < 0) {
          return -1;
        }        /* over-subscribed */
      }
      if (left > 0 && (type === CODES$1 || max !== 1)) {
        return -1;                      /* incomplete set */
      }

      /* generate offsets into symbol table for each length for sorting */
      offs[1] = 0;
      for (len = 1; len < MAXBITS; len++) {
        offs[len + 1] = offs[len] + count[len];
      }

      /* sort symbols by length, by symbol order within each length */
      for (sym = 0; sym < codes; sym++) {
        if (lens[lens_index + sym] !== 0) {
          work[offs[lens[lens_index + sym]]++] = sym;
        }
      }

      /*
       Create and fill in decoding tables.  In this loop, the table being
       filled is at next and has curr index bits.  The code being used is huff
       with length len.  That code is converted to an index by dropping drop
       bits off of the bottom.  For codes where len is less than drop + curr,
       those top drop + curr - len bits are incremented through all values to
       fill the table with replicated entries.

       root is the number of index bits for the root table.  When len exceeds
       root, sub-tables are created pointed to by the root entry with an index
       of the low root bits of huff.  This is saved in low to check for when a
       new sub-table should be started.  drop is zero when the root table is
       being filled, and drop is root when sub-tables are being filled.

       When a new sub-table is needed, it is necessary to look ahead in the
       code lengths to determine what size sub-table is needed.  The length
       counts are used for this, and so count[] is decremented as codes are
       entered in the tables.

       used keeps track of how many table entries have been allocated from the
       provided *table space.  It is checked for LENS and DIST tables against
       the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
       the initial root table size constants.  See the comments in inftrees.h
       for more information.

       sym increments through all symbols, and the loop terminates when
       all codes of length max, i.e. all codes, have been processed.  This
       routine permits incomplete codes, so another loop after this one fills
       in the rest of the decoding tables with invalid code markers.
       */

      /* set up for code type */
      // poor man optimization - use if-else instead of switch,
      // to avoid deopts in old v8
      if (type === CODES$1) {
        base = extra = work;    /* dummy value--not used */
        match = 20;

      } else if (type === LENS$1) {
        base = lbase;
        extra = lext;
        match = 257;

      } else {                    /* DISTS */
        base = dbase;
        extra = dext;
        match = 0;
      }

      /* initialize opts for loop */
      huff = 0;                   /* starting code */
      sym = 0;                    /* starting code symbol */
      len = min;                  /* starting code length */
      next = table_index;              /* current table to fill in */
      curr = root;                /* current table index bits */
      drop = 0;                   /* current bits to drop from code for index */
      low = -1;                   /* trigger new sub-table when len > root */
      used = 1 << root;          /* use root table entries */
      mask = used - 1;            /* mask for comparing low */

      /* check available table space */
      if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
        (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
        return 1;
      }

      /* process all codes and make table entries */
      for (;;) {
        /* create table entry */
        here_bits = len - drop;
        if (work[sym] + 1 < match) {
          here_op = 0;
          here_val = work[sym];
        }
        else if (work[sym] >= match) {
          here_op = extra[work[sym] - match];
          here_val = base[work[sym] - match];
        }
        else {
          here_op = 32 + 64;         /* end of block */
          here_val = 0;
        }

        /* replicate for those indices with low len bits equal to huff */
        incr = 1 << (len - drop);
        fill = 1 << curr;
        min = fill;                 /* save offset to next table */
        do {
          fill -= incr;
          table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
        } while (fill !== 0);

        /* backwards increment the len-bit code huff */
        incr = 1 << (len - 1);
        while (huff & incr) {
          incr >>= 1;
        }
        if (incr !== 0) {
          huff &= incr - 1;
          huff += incr;
        } else {
          huff = 0;
        }

        /* go to next symbol, update count, len */
        sym++;
        if (--count[len] === 0) {
          if (len === max) { break; }
          len = lens[lens_index + work[sym]];
        }

        /* create new sub-table if needed */
        if (len > root && (huff & mask) !== low) {
          /* if first time, transition to sub-tables */
          if (drop === 0) {
            drop = root;
          }

          /* increment past last table */
          next += min;            /* here min is 1 << curr */

          /* determine length of next table */
          curr = len - drop;
          left = 1 << curr;
          while (curr + drop < max) {
            left -= count[curr + drop];
            if (left <= 0) { break; }
            curr++;
            left <<= 1;
          }

          /* check for enough space */
          used += 1 << curr;
          if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
            (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
            return 1;
          }

          /* point entry in root table to sub-table */
          low = huff & mask;
          /*table.op[low] = curr;
          table.bits[low] = root;
          table.val[low] = next - opts.table_index;*/
          table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
        }
      }

      /* fill in remaining table entry if code is incomplete (guaranteed to have
       at most one remaining entry, since if the code is incomplete, the
       maximum code length that was allowed to get this far is one bit) */
      if (huff !== 0) {
        //table.op[next + huff] = 64;            /* invalid code marker */
        //table.bits[next + huff] = len - drop;
        //table.val[next + huff] = 0;
        table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
      }

      /* set return parameters */
      //opts.table_index += used;
      opts.bits = root;
      return 0;
    };


    var inftrees = inflate_table;

    // (C) 1995-2013 Jean-loup Gailly and Mark Adler
    // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
    //
    // This software is provided 'as-is', without any express or implied
    // warranty. In no event will the authors be held liable for any damages
    // arising from the use of this software.
    //
    // Permission is granted to anyone to use this software for any purpose,
    // including commercial applications, and to alter it and redistribute it
    // freely, subject to the following restrictions:
    //
    // 1. The origin of this software must not be misrepresented; you must not
    //   claim that you wrote the original software. If you use this software
    //   in a product, an acknowledgment in the product documentation would be
    //   appreciated but is not required.
    // 2. Altered source versions must be plainly marked as such, and must not be
    //   misrepresented as being the original software.
    // 3. This notice may not be removed or altered from any source distribution.






    const CODES = 0;
    const LENS = 1;
    const DISTS = 2;

    /* Public constants ==========================================================*/
    /* ===========================================================================*/

    const {
      Z_FINISH: Z_FINISH$1, Z_BLOCK, Z_TREES,
      Z_OK: Z_OK$1, Z_STREAM_END: Z_STREAM_END$1, Z_NEED_DICT: Z_NEED_DICT$1, Z_STREAM_ERROR: Z_STREAM_ERROR$1, Z_DATA_ERROR: Z_DATA_ERROR$1, Z_MEM_ERROR: Z_MEM_ERROR$1, Z_BUF_ERROR,
      Z_DEFLATED
    } = constants$2;


    /* STATES ====================================================================*/
    /* ===========================================================================*/


    const    HEAD = 16180;       /* i: waiting for magic header */
    const    FLAGS = 16181;      /* i: waiting for method and flags (gzip) */
    const    TIME = 16182;       /* i: waiting for modification time (gzip) */
    const    OS = 16183;         /* i: waiting for extra flags and operating system (gzip) */
    const    EXLEN = 16184;      /* i: waiting for extra length (gzip) */
    const    EXTRA = 16185;      /* i: waiting for extra bytes (gzip) */
    const    NAME = 16186;       /* i: waiting for end of file name (gzip) */
    const    COMMENT = 16187;    /* i: waiting for end of comment (gzip) */
    const    HCRC = 16188;       /* i: waiting for header crc (gzip) */
    const    DICTID = 16189;    /* i: waiting for dictionary check value */
    const    DICT = 16190;      /* waiting for inflateSetDictionary() call */
    const        TYPE = 16191;      /* i: waiting for type bits, including last-flag bit */
    const        TYPEDO = 16192;    /* i: same, but skip check to exit inflate on new block */
    const        STORED = 16193;    /* i: waiting for stored size (length and complement) */
    const        COPY_ = 16194;     /* i/o: same as COPY below, but only first time in */
    const        COPY = 16195;      /* i/o: waiting for input or output to copy stored block */
    const        TABLE = 16196;     /* i: waiting for dynamic block table lengths */
    const        LENLENS = 16197;   /* i: waiting for code length code lengths */
    const        CODELENS = 16198;  /* i: waiting for length/lit and distance code lengths */
    const            LEN_ = 16199;      /* i: same as LEN below, but only first time in */
    const            LEN = 16200;       /* i: waiting for length/lit/eob code */
    const            LENEXT = 16201;    /* i: waiting for length extra bits */
    const            DIST = 16202;      /* i: waiting for distance code */
    const            DISTEXT = 16203;   /* i: waiting for distance extra bits */
    const            MATCH = 16204;     /* o: waiting for output space to copy string */
    const            LIT = 16205;       /* o: waiting for output space to write literal */
    const    CHECK = 16206;     /* i: waiting for 32-bit check value */
    const    LENGTH = 16207;    /* i: waiting for 32-bit length (gzip) */
    const    DONE = 16208;      /* finished check, done -- remain here until reset */
    const    BAD = 16209;       /* got a data error -- remain here until reset */
    const    MEM = 16210;       /* got an inflate() memory error -- remain here until reset */
    const    SYNC = 16211;      /* looking for synchronization bytes to restart inflate() */

    /* ===========================================================================*/



    const ENOUGH_LENS = 852;
    const ENOUGH_DISTS = 592;
    //const ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

    const MAX_WBITS = 15;
    /* 32K LZ77 window */
    const DEF_WBITS = MAX_WBITS;


    const zswap32 = (q) => {

      return  (((q >>> 24) & 0xff) +
              ((q >>> 8) & 0xff00) +
              ((q & 0xff00) << 8) +
              ((q & 0xff) << 24));
    };


    function InflateState() {
      this.strm = null;           /* pointer back to this zlib stream */
      this.mode = 0;              /* current inflate mode */
      this.last = false;          /* true if processing last block */
      this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip,
                                     bit 2 true to validate check value */
      this.havedict = false;      /* true if dictionary provided */
      this.flags = 0;             /* gzip header method and flags (0 if zlib), or
                                     -1 if raw or no header yet */
      this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
      this.check = 0;             /* protected copy of check value */
      this.total = 0;             /* protected copy of output count */
      // TODO: may be {}
      this.head = null;           /* where to save gzip header information */

      /* sliding window */
      this.wbits = 0;             /* log base 2 of requested window size */
      this.wsize = 0;             /* window size or zero if not using window */
      this.whave = 0;             /* valid bytes in the window */
      this.wnext = 0;             /* window write index */
      this.window = null;         /* allocated sliding window, if needed */

      /* bit accumulator */
      this.hold = 0;              /* input bit accumulator */
      this.bits = 0;              /* number of bits in "in" */

      /* for string and stored block copying */
      this.length = 0;            /* literal or length of data to copy */
      this.offset = 0;            /* distance back to copy string from */

      /* for table and code decoding */
      this.extra = 0;             /* extra bits needed */

      /* fixed and dynamic code tables */
      this.lencode = null;          /* starting table for length/literal codes */
      this.distcode = null;         /* starting table for distance codes */
      this.lenbits = 0;           /* index bits for lencode */
      this.distbits = 0;          /* index bits for distcode */

      /* dynamic table building */
      this.ncode = 0;             /* number of code length code lengths */
      this.nlen = 0;              /* number of length code lengths */
      this.ndist = 0;             /* number of distance code lengths */
      this.have = 0;              /* number of code lengths in lens[] */
      this.next = null;              /* next available space in codes[] */

      this.lens = new Uint16Array(320); /* temporary storage for code lengths */
      this.work = new Uint16Array(288); /* work area for code table building */

      /*
       because we don't have pointers in js, we use lencode and distcode directly
       as buffers so we don't need codes
      */
      //this.codes = new Int32Array(ENOUGH);       /* space for code tables */
      this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
      this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
      this.sane = 0;                   /* if false, allow invalid distance too far */
      this.back = 0;                   /* bits back of last unprocessed length/lit */
      this.was = 0;                    /* initial length of match */
    }


    const inflateStateCheck = (strm) => {

      if (!strm) {
        return 1;
      }
      const state = strm.state;
      if (!state || state.strm !== strm ||
        state.mode < HEAD || state.mode > SYNC) {
        return 1;
      }
      return 0;
    };


    const inflateResetKeep = (strm) => {

      if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
      const state = strm.state;
      strm.total_in = strm.total_out = state.total = 0;
      strm.msg = ''; /*Z_NULL*/
      if (state.wrap) {       /* to support ill-conceived Java test suite */
        strm.adler = state.wrap & 1;
      }
      state.mode = HEAD;
      state.last = 0;
      state.havedict = 0;
      state.flags = -1;
      state.dmax = 32768;
      state.head = null/*Z_NULL*/;
      state.hold = 0;
      state.bits = 0;
      //state.lencode = state.distcode = state.next = state.codes;
      state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
      state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);

      state.sane = 1;
      state.back = -1;
      //Tracev((stderr, "inflate: reset\n"));
      return Z_OK$1;
    };


    const inflateReset = (strm) => {

      if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
      const state = strm.state;
      state.wsize = 0;
      state.whave = 0;
      state.wnext = 0;
      return inflateResetKeep(strm);

    };


    const inflateReset2 = (strm, windowBits) => {
      let wrap;

      /* get the state */
      if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
      const state = strm.state;

      /* extract wrap request from windowBits parameter */
      if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
      }
      else {
        wrap = (windowBits >> 4) + 5;
        if (windowBits < 48) {
          windowBits &= 15;
        }
      }

      /* set number of window bits, free window if different */
      if (windowBits && (windowBits < 8 || windowBits > 15)) {
        return Z_STREAM_ERROR$1;
      }
      if (state.window !== null && state.wbits !== windowBits) {
        state.window = null;
      }

      /* update state and reset the rest of it */
      state.wrap = wrap;
      state.wbits = windowBits;
      return inflateReset(strm);
    };


    const inflateInit2 = (strm, windowBits) => {

      if (!strm) { return Z_STREAM_ERROR$1; }
      //strm.msg = Z_NULL;                 /* in case we return an error */

      const state = new InflateState();

      //if (state === Z_NULL) return Z_MEM_ERROR;
      //Tracev((stderr, "inflate: allocated\n"));
      strm.state = state;
      state.strm = strm;
      state.window = null/*Z_NULL*/;
      state.mode = HEAD;     /* to pass state test in inflateReset2() */
      const ret = inflateReset2(strm, windowBits);
      if (ret !== Z_OK$1) {
        strm.state = null/*Z_NULL*/;
      }
      return ret;
    };


    const inflateInit = (strm) => {

      return inflateInit2(strm, DEF_WBITS);
    };


    /*
     Return state with length and distance decoding tables and index sizes set to
     fixed code decoding.  Normally this returns fixed tables from inffixed.h.
     If BUILDFIXED is defined, then instead this routine builds the tables the
     first time it's called, and returns those tables the first time and
     thereafter.  This reduces the size of the code by about 2K bytes, in
     exchange for a little execution time.  However, BUILDFIXED should not be
     used for threaded applications, since the rewriting of the tables and virgin
     may not be thread-safe.
     */
    let virgin = true;

    let lenfix, distfix; // We have no pointers in JS, so keep tables separate


    const fixedtables = (state) => {

      /* build fixed huffman tables if first call (may not be thread safe) */
      if (virgin) {
        lenfix = new Int32Array(512);
        distfix = new Int32Array(32);

        /* literal/length table */
        let sym = 0;
        while (sym < 144) { state.lens[sym++] = 8; }
        while (sym < 256) { state.lens[sym++] = 9; }
        while (sym < 280) { state.lens[sym++] = 7; }
        while (sym < 288) { state.lens[sym++] = 8; }

        inftrees(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

        /* distance table */
        sym = 0;
        while (sym < 32) { state.lens[sym++] = 5; }

        inftrees(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

        /* do this just once */
        virgin = false;
      }

      state.lencode = lenfix;
      state.lenbits = 9;
      state.distcode = distfix;
      state.distbits = 5;
    };


    /*
     Update the window with the last wsize (normally 32K) bytes written before
     returning.  If window does not exist yet, create it.  This is only called
     when a window is already in use, or when output has been written during this
     inflate call, but the end of the deflate stream has not been reached yet.
     It is also called to create a window for dictionary data when a dictionary
     is loaded.

     Providing output buffers larger than 32K to inflate() should provide a speed
     advantage, since only the last 32K of output is copied to the sliding window
     upon return from inflate(), and since all distances after the first 32K of
     output will fall in the output data, making match copies simpler and faster.
     The advantage may be dependent on the size of the processor's data caches.
     */
    const updatewindow = (strm, src, end, copy) => {

      let dist;
      const state = strm.state;

      /* if it hasn't been done already, allocate space for the window */
      if (state.window === null) {
        state.wsize = 1 << state.wbits;
        state.wnext = 0;
        state.whave = 0;

        state.window = new Uint8Array(state.wsize);
      }

      /* copy state->wsize or less output bytes into the circular window */
      if (copy >= state.wsize) {
        state.window.set(src.subarray(end - state.wsize, end), 0);
        state.wnext = 0;
        state.whave = state.wsize;
      }
      else {
        dist = state.wsize - state.wnext;
        if (dist > copy) {
          dist = copy;
        }
        //zmemcpy(state->window + state->wnext, end - copy, dist);
        state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
        copy -= dist;
        if (copy) {
          //zmemcpy(state->window, end - copy, copy);
          state.window.set(src.subarray(end - copy, end), 0);
          state.wnext = copy;
          state.whave = state.wsize;
        }
        else {
          state.wnext += dist;
          if (state.wnext === state.wsize) { state.wnext = 0; }
          if (state.whave < state.wsize) { state.whave += dist; }
        }
      }
      return 0;
    };


    const inflate$2 = (strm, flush) => {

      let state;
      let input, output;          // input/output buffers
      let next;                   /* next input INDEX */
      let put;                    /* next output INDEX */
      let have, left;             /* available input and output */
      let hold;                   /* bit buffer */
      let bits;                   /* bits in bit buffer */
      let _in, _out;              /* save starting available input and output */
      let copy;                   /* number of stored or match bytes to copy */
      let from;                   /* where to copy match bytes from */
      let from_source;
      let here = 0;               /* current decoding table entry */
      let here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
      //let last;                   /* parent table entry */
      let last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
      let len;                    /* length to copy for repeats, bits to drop */
      let ret;                    /* return code */
      const hbuf = new Uint8Array(4);    /* buffer for gzip header crc calculation */
      let opts;

      let n; // temporary variable for NEED_BITS

      const order = /* permutation of code lengths */
        new Uint8Array([ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ]);


      if (inflateStateCheck(strm) || !strm.output ||
          (!strm.input && strm.avail_in !== 0)) {
        return Z_STREAM_ERROR$1;
      }

      state = strm.state;
      if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


      //--- LOAD() ---
      put = strm.next_out;
      output = strm.output;
      left = strm.avail_out;
      next = strm.next_in;
      input = strm.input;
      have = strm.avail_in;
      hold = state.hold;
      bits = state.bits;
      //---

      _in = have;
      _out = left;
      ret = Z_OK$1;

      inf_leave: // goto emulation
      for (;;) {
        switch (state.mode) {
          case HEAD:
            if (state.wrap === 0) {
              state.mode = TYPEDO;
              break;
            }
            //=== NEEDBITS(16);
            while (bits < 16) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
              if (state.wbits === 0) {
                state.wbits = 15;
              }
              state.check = 0/*crc32(0L, Z_NULL, 0)*/;
              //=== CRC2(state.check, hold);
              hbuf[0] = hold & 0xff;
              hbuf[1] = (hold >>> 8) & 0xff;
              state.check = crc32_1(state.check, hbuf, 2, 0);
              //===//

              //=== INITBITS();
              hold = 0;
              bits = 0;
              //===//
              state.mode = FLAGS;
              break;
            }
            if (state.head) {
              state.head.done = false;
            }
            if (!(state.wrap & 1) ||   /* check if zlib header allowed */
              (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
              strm.msg = 'incorrect header check';
              state.mode = BAD;
              break;
            }
            if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
              strm.msg = 'unknown compression method';
              state.mode = BAD;
              break;
            }
            //--- DROPBITS(4) ---//
            hold >>>= 4;
            bits -= 4;
            //---//
            len = (hold & 0x0f)/*BITS(4)*/ + 8;
            if (state.wbits === 0) {
              state.wbits = len;
            }
            if (len > 15 || len > state.wbits) {
              strm.msg = 'invalid window size';
              state.mode = BAD;
              break;
            }

            // !!! pako patch. Force use `options.windowBits` if passed.
            // Required to always use max window size by default.
            state.dmax = 1 << state.wbits;
            //state.dmax = 1 << len;

            state.flags = 0;               /* indicate zlib header */
            //Tracev((stderr, "inflate:   zlib header ok\n"));
            strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
            state.mode = hold & 0x200 ? DICTID : TYPE;
            //=== INITBITS();
            hold = 0;
            bits = 0;
            //===//
            break;
          case FLAGS:
            //=== NEEDBITS(16); */
            while (bits < 16) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            state.flags = hold;
            if ((state.flags & 0xff) !== Z_DEFLATED) {
              strm.msg = 'unknown compression method';
              state.mode = BAD;
              break;
            }
            if (state.flags & 0xe000) {
              strm.msg = 'unknown header flags set';
              state.mode = BAD;
              break;
            }
            if (state.head) {
              state.head.text = ((hold >> 8) & 1);
            }
            if ((state.flags & 0x0200) && (state.wrap & 4)) {
              //=== CRC2(state.check, hold);
              hbuf[0] = hold & 0xff;
              hbuf[1] = (hold >>> 8) & 0xff;
              state.check = crc32_1(state.check, hbuf, 2, 0);
              //===//
            }
            //=== INITBITS();
            hold = 0;
            bits = 0;
            //===//
            state.mode = TIME;
            /* falls through */
          case TIME:
            //=== NEEDBITS(32); */
            while (bits < 32) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            if (state.head) {
              state.head.time = hold;
            }
            if ((state.flags & 0x0200) && (state.wrap & 4)) {
              //=== CRC4(state.check, hold)
              hbuf[0] = hold & 0xff;
              hbuf[1] = (hold >>> 8) & 0xff;
              hbuf[2] = (hold >>> 16) & 0xff;
              hbuf[3] = (hold >>> 24) & 0xff;
              state.check = crc32_1(state.check, hbuf, 4, 0);
              //===
            }
            //=== INITBITS();
            hold = 0;
            bits = 0;
            //===//
            state.mode = OS;
            /* falls through */
          case OS:
            //=== NEEDBITS(16); */
            while (bits < 16) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            if (state.head) {
              state.head.xflags = (hold & 0xff);
              state.head.os = (hold >> 8);
            }
            if ((state.flags & 0x0200) && (state.wrap & 4)) {
              //=== CRC2(state.check, hold);
              hbuf[0] = hold & 0xff;
              hbuf[1] = (hold >>> 8) & 0xff;
              state.check = crc32_1(state.check, hbuf, 2, 0);
              //===//
            }
            //=== INITBITS();
            hold = 0;
            bits = 0;
            //===//
            state.mode = EXLEN;
            /* falls through */
          case EXLEN:
            if (state.flags & 0x0400) {
              //=== NEEDBITS(16); */
              while (bits < 16) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              state.length = hold;
              if (state.head) {
                state.head.extra_len = hold;
              }
              if ((state.flags & 0x0200) && (state.wrap & 4)) {
                //=== CRC2(state.check, hold);
                hbuf[0] = hold & 0xff;
                hbuf[1] = (hold >>> 8) & 0xff;
                state.check = crc32_1(state.check, hbuf, 2, 0);
                //===//
              }
              //=== INITBITS();
              hold = 0;
              bits = 0;
              //===//
            }
            else if (state.head) {
              state.head.extra = null/*Z_NULL*/;
            }
            state.mode = EXTRA;
            /* falls through */
          case EXTRA:
            if (state.flags & 0x0400) {
              copy = state.length;
              if (copy > have) { copy = have; }
              if (copy) {
                if (state.head) {
                  len = state.head.extra_len - state.length;
                  if (!state.head.extra) {
                    // Use untyped array for more convenient processing later
                    state.head.extra = new Uint8Array(state.head.extra_len);
                  }
                  state.head.extra.set(
                    input.subarray(
                      next,
                      // extra field is limited to 65536 bytes
                      // - no need for additional size check
                      next + copy
                    ),
                    /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                    len
                  );
                  //zmemcpy(state.head.extra + len, next,
                  //        len + copy > state.head.extra_max ?
                  //        state.head.extra_max - len : copy);
                }
                if ((state.flags & 0x0200) && (state.wrap & 4)) {
                  state.check = crc32_1(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                state.length -= copy;
              }
              if (state.length) { break inf_leave; }
            }
            state.length = 0;
            state.mode = NAME;
            /* falls through */
          case NAME:
            if (state.flags & 0x0800) {
              if (have === 0) { break inf_leave; }
              copy = 0;
              do {
                // TODO: 2 or 1 bytes?
                len = input[next + copy++];
                /* use constant limit because in js we should not preallocate memory */
                if (state.head && len &&
                    (state.length < 65536 /*state.head.name_max*/)) {
                  state.head.name += String.fromCharCode(len);
                }
              } while (len && copy < have);

              if ((state.flags & 0x0200) && (state.wrap & 4)) {
                state.check = crc32_1(state.check, input, copy, next);
              }
              have -= copy;
              next += copy;
              if (len) { break inf_leave; }
            }
            else if (state.head) {
              state.head.name = null;
            }
            state.length = 0;
            state.mode = COMMENT;
            /* falls through */
          case COMMENT:
            if (state.flags & 0x1000) {
              if (have === 0) { break inf_leave; }
              copy = 0;
              do {
                len = input[next + copy++];
                /* use constant limit because in js we should not preallocate memory */
                if (state.head && len &&
                    (state.length < 65536 /*state.head.comm_max*/)) {
                  state.head.comment += String.fromCharCode(len);
                }
              } while (len && copy < have);
              if ((state.flags & 0x0200) && (state.wrap & 4)) {
                state.check = crc32_1(state.check, input, copy, next);
              }
              have -= copy;
              next += copy;
              if (len) { break inf_leave; }
            }
            else if (state.head) {
              state.head.comment = null;
            }
            state.mode = HCRC;
            /* falls through */
          case HCRC:
            if (state.flags & 0x0200) {
              //=== NEEDBITS(16); */
              while (bits < 16) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              if ((state.wrap & 4) && hold !== (state.check & 0xffff)) {
                strm.msg = 'header crc mismatch';
                state.mode = BAD;
                break;
              }
              //=== INITBITS();
              hold = 0;
              bits = 0;
              //===//
            }
            if (state.head) {
              state.head.hcrc = ((state.flags >> 9) & 1);
              state.head.done = true;
            }
            strm.adler = state.check = 0;
            state.mode = TYPE;
            break;
          case DICTID:
            //=== NEEDBITS(32); */
            while (bits < 32) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            strm.adler = state.check = zswap32(hold);
            //=== INITBITS();
            hold = 0;
            bits = 0;
            //===//
            state.mode = DICT;
            /* falls through */
          case DICT:
            if (state.havedict === 0) {
              //--- RESTORE() ---
              strm.next_out = put;
              strm.avail_out = left;
              strm.next_in = next;
              strm.avail_in = have;
              state.hold = hold;
              state.bits = bits;
              //---
              return Z_NEED_DICT$1;
            }
            strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
            state.mode = TYPE;
            /* falls through */
          case TYPE:
            if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
            /* falls through */
          case TYPEDO:
            if (state.last) {
              //--- BYTEBITS() ---//
              hold >>>= bits & 7;
              bits -= bits & 7;
              //---//
              state.mode = CHECK;
              break;
            }
            //=== NEEDBITS(3); */
            while (bits < 3) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            state.last = (hold & 0x01)/*BITS(1)*/;
            //--- DROPBITS(1) ---//
            hold >>>= 1;
            bits -= 1;
            //---//

            switch ((hold & 0x03)/*BITS(2)*/) {
              case 0:                             /* stored block */
                //Tracev((stderr, "inflate:     stored block%s\n",
                //        state.last ? " (last)" : ""));
                state.mode = STORED;
                break;
              case 1:                             /* fixed block */
                fixedtables(state);
                //Tracev((stderr, "inflate:     fixed codes block%s\n",
                //        state.last ? " (last)" : ""));
                state.mode = LEN_;             /* decode codes */
                if (flush === Z_TREES) {
                  //--- DROPBITS(2) ---//
                  hold >>>= 2;
                  bits -= 2;
                  //---//
                  break inf_leave;
                }
                break;
              case 2:                             /* dynamic block */
                //Tracev((stderr, "inflate:     dynamic codes block%s\n",
                //        state.last ? " (last)" : ""));
                state.mode = TABLE;
                break;
              case 3:
                strm.msg = 'invalid block type';
                state.mode = BAD;
            }
            //--- DROPBITS(2) ---//
            hold >>>= 2;
            bits -= 2;
            //---//
            break;
          case STORED:
            //--- BYTEBITS() ---// /* go to byte boundary */
            hold >>>= bits & 7;
            bits -= bits & 7;
            //---//
            //=== NEEDBITS(32); */
            while (bits < 32) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
              strm.msg = 'invalid stored block lengths';
              state.mode = BAD;
              break;
            }
            state.length = hold & 0xffff;
            //Tracev((stderr, "inflate:       stored length %u\n",
            //        state.length));
            //=== INITBITS();
            hold = 0;
            bits = 0;
            //===//
            state.mode = COPY_;
            if (flush === Z_TREES) { break inf_leave; }
            /* falls through */
          case COPY_:
            state.mode = COPY;
            /* falls through */
          case COPY:
            copy = state.length;
            if (copy) {
              if (copy > have) { copy = have; }
              if (copy > left) { copy = left; }
              if (copy === 0) { break inf_leave; }
              //--- zmemcpy(put, next, copy); ---
              output.set(input.subarray(next, next + copy), put);
              //---//
              have -= copy;
              next += copy;
              left -= copy;
              put += copy;
              state.length -= copy;
              break;
            }
            //Tracev((stderr, "inflate:       stored end\n"));
            state.mode = TYPE;
            break;
          case TABLE:
            //=== NEEDBITS(14); */
            while (bits < 14) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
            //--- DROPBITS(5) ---//
            hold >>>= 5;
            bits -= 5;
            //---//
            state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
            //--- DROPBITS(5) ---//
            hold >>>= 5;
            bits -= 5;
            //---//
            state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
            //--- DROPBITS(4) ---//
            hold >>>= 4;
            bits -= 4;
            //---//
    //#ifndef PKZIP_BUG_WORKAROUND
            if (state.nlen > 286 || state.ndist > 30) {
              strm.msg = 'too many length or distance symbols';
              state.mode = BAD;
              break;
            }
    //#endif
            //Tracev((stderr, "inflate:       table sizes ok\n"));
            state.have = 0;
            state.mode = LENLENS;
            /* falls through */
          case LENLENS:
            while (state.have < state.ncode) {
              //=== NEEDBITS(3);
              while (bits < 3) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
              //--- DROPBITS(3) ---//
              hold >>>= 3;
              bits -= 3;
              //---//
            }
            while (state.have < 19) {
              state.lens[order[state.have++]] = 0;
            }
            // We have separate tables & no pointers. 2 commented lines below not needed.
            //state.next = state.codes;
            //state.lencode = state.next;
            // Switch to use dynamic table
            state.lencode = state.lendyn;
            state.lenbits = 7;

            opts = { bits: state.lenbits };
            ret = inftrees(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
            state.lenbits = opts.bits;

            if (ret) {
              strm.msg = 'invalid code lengths set';
              state.mode = BAD;
              break;
            }
            //Tracev((stderr, "inflate:       code lengths ok\n"));
            state.have = 0;
            state.mode = CODELENS;
            /* falls through */
          case CODELENS:
            while (state.have < state.nlen + state.ndist) {
              for (;;) {
                here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
                here_bits = here >>> 24;
                here_op = (here >>> 16) & 0xff;
                here_val = here & 0xffff;

                if ((here_bits) <= bits) { break; }
                //--- PULLBYTE() ---//
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
                //---//
              }
              if (here_val < 16) {
                //--- DROPBITS(here.bits) ---//
                hold >>>= here_bits;
                bits -= here_bits;
                //---//
                state.lens[state.have++] = here_val;
              }
              else {
                if (here_val === 16) {
                  //=== NEEDBITS(here.bits + 2);
                  n = here_bits + 2;
                  while (bits < n) {
                    if (have === 0) { break inf_leave; }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  //--- DROPBITS(here.bits) ---//
                  hold >>>= here_bits;
                  bits -= here_bits;
                  //---//
                  if (state.have === 0) {
                    strm.msg = 'invalid bit length repeat';
                    state.mode = BAD;
                    break;
                  }
                  len = state.lens[state.have - 1];
                  copy = 3 + (hold & 0x03);//BITS(2);
                  //--- DROPBITS(2) ---//
                  hold >>>= 2;
                  bits -= 2;
                  //---//
                }
                else if (here_val === 17) {
                  //=== NEEDBITS(here.bits + 3);
                  n = here_bits + 3;
                  while (bits < n) {
                    if (have === 0) { break inf_leave; }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  //--- DROPBITS(here.bits) ---//
                  hold >>>= here_bits;
                  bits -= here_bits;
                  //---//
                  len = 0;
                  copy = 3 + (hold & 0x07);//BITS(3);
                  //--- DROPBITS(3) ---//
                  hold >>>= 3;
                  bits -= 3;
                  //---//
                }
                else {
                  //=== NEEDBITS(here.bits + 7);
                  n = here_bits + 7;
                  while (bits < n) {
                    if (have === 0) { break inf_leave; }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  //--- DROPBITS(here.bits) ---//
                  hold >>>= here_bits;
                  bits -= here_bits;
                  //---//
                  len = 0;
                  copy = 11 + (hold & 0x7f);//BITS(7);
                  //--- DROPBITS(7) ---//
                  hold >>>= 7;
                  bits -= 7;
                  //---//
                }
                if (state.have + copy > state.nlen + state.ndist) {
                  strm.msg = 'invalid bit length repeat';
                  state.mode = BAD;
                  break;
                }
                while (copy--) {
                  state.lens[state.have++] = len;
                }
              }
            }

            /* handle error breaks in while */
            if (state.mode === BAD) { break; }

            /* check for end-of-block code (better have one) */
            if (state.lens[256] === 0) {
              strm.msg = 'invalid code -- missing end-of-block';
              state.mode = BAD;
              break;
            }

            /* build code tables -- note: do not change the lenbits or distbits
               values here (9 and 6) without reading the comments in inftrees.h
               concerning the ENOUGH constants, which depend on those values */
            state.lenbits = 9;

            opts = { bits: state.lenbits };
            ret = inftrees(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
            // We have separate tables & no pointers. 2 commented lines below not needed.
            // state.next_index = opts.table_index;
            state.lenbits = opts.bits;
            // state.lencode = state.next;

            if (ret) {
              strm.msg = 'invalid literal/lengths set';
              state.mode = BAD;
              break;
            }

            state.distbits = 6;
            //state.distcode.copy(state.codes);
            // Switch to use dynamic table
            state.distcode = state.distdyn;
            opts = { bits: state.distbits };
            ret = inftrees(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
            // We have separate tables & no pointers. 2 commented lines below not needed.
            // state.next_index = opts.table_index;
            state.distbits = opts.bits;
            // state.distcode = state.next;

            if (ret) {
              strm.msg = 'invalid distances set';
              state.mode = BAD;
              break;
            }
            //Tracev((stderr, 'inflate:       codes ok\n'));
            state.mode = LEN_;
            if (flush === Z_TREES) { break inf_leave; }
            /* falls through */
          case LEN_:
            state.mode = LEN;
            /* falls through */
          case LEN:
            if (have >= 6 && left >= 258) {
              //--- RESTORE() ---
              strm.next_out = put;
              strm.avail_out = left;
              strm.next_in = next;
              strm.avail_in = have;
              state.hold = hold;
              state.bits = bits;
              //---
              inffast(strm, _out);
              //--- LOAD() ---
              put = strm.next_out;
              output = strm.output;
              left = strm.avail_out;
              next = strm.next_in;
              input = strm.input;
              have = strm.avail_in;
              hold = state.hold;
              bits = state.bits;
              //---

              if (state.mode === TYPE) {
                state.back = -1;
              }
              break;
            }
            state.back = 0;
            for (;;) {
              here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
              here_bits = here >>> 24;
              here_op = (here >>> 16) & 0xff;
              here_val = here & 0xffff;

              if (here_bits <= bits) { break; }
              //--- PULLBYTE() ---//
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
              //---//
            }
            if (here_op && (here_op & 0xf0) === 0) {
              last_bits = here_bits;
              last_op = here_op;
              last_val = here_val;
              for (;;) {
                here = state.lencode[last_val +
                        ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
                here_bits = here >>> 24;
                here_op = (here >>> 16) & 0xff;
                here_val = here & 0xffff;

                if ((last_bits + here_bits) <= bits) { break; }
                //--- PULLBYTE() ---//
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
                //---//
              }
              //--- DROPBITS(last.bits) ---//
              hold >>>= last_bits;
              bits -= last_bits;
              //---//
              state.back += last_bits;
            }
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.back += here_bits;
            state.length = here_val;
            if (here_op === 0) {
              //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
              //        "inflate:         literal '%c'\n" :
              //        "inflate:         literal 0x%02x\n", here.val));
              state.mode = LIT;
              break;
            }
            if (here_op & 32) {
              //Tracevv((stderr, "inflate:         end of block\n"));
              state.back = -1;
              state.mode = TYPE;
              break;
            }
            if (here_op & 64) {
              strm.msg = 'invalid literal/length code';
              state.mode = BAD;
              break;
            }
            state.extra = here_op & 15;
            state.mode = LENEXT;
            /* falls through */
          case LENEXT:
            if (state.extra) {
              //=== NEEDBITS(state.extra);
              n = state.extra;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
              //--- DROPBITS(state.extra) ---//
              hold >>>= state.extra;
              bits -= state.extra;
              //---//
              state.back += state.extra;
            }
            //Tracevv((stderr, "inflate:         length %u\n", state.length));
            state.was = state.length;
            state.mode = DIST;
            /* falls through */
          case DIST:
            for (;;) {
              here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
              here_bits = here >>> 24;
              here_op = (here >>> 16) & 0xff;
              here_val = here & 0xffff;

              if ((here_bits) <= bits) { break; }
              //--- PULLBYTE() ---//
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
              //---//
            }
            if ((here_op & 0xf0) === 0) {
              last_bits = here_bits;
              last_op = here_op;
              last_val = here_val;
              for (;;) {
                here = state.distcode[last_val +
                        ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
                here_bits = here >>> 24;
                here_op = (here >>> 16) & 0xff;
                here_val = here & 0xffff;

                if ((last_bits + here_bits) <= bits) { break; }
                //--- PULLBYTE() ---//
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
                //---//
              }
              //--- DROPBITS(last.bits) ---//
              hold >>>= last_bits;
              bits -= last_bits;
              //---//
              state.back += last_bits;
            }
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.back += here_bits;
            if (here_op & 64) {
              strm.msg = 'invalid distance code';
              state.mode = BAD;
              break;
            }
            state.offset = here_val;
            state.extra = (here_op) & 15;
            state.mode = DISTEXT;
            /* falls through */
          case DISTEXT:
            if (state.extra) {
              //=== NEEDBITS(state.extra);
              n = state.extra;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
              //--- DROPBITS(state.extra) ---//
              hold >>>= state.extra;
              bits -= state.extra;
              //---//
              state.back += state.extra;
            }
    //#ifdef INFLATE_STRICT
            if (state.offset > state.dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break;
            }
    //#endif
            //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
            state.mode = MATCH;
            /* falls through */
          case MATCH:
            if (left === 0) { break inf_leave; }
            copy = _out - left;
            if (state.offset > copy) {         /* copy from window */
              copy = state.offset - copy;
              if (copy > state.whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break;
                }
    // (!) This block is disabled in zlib defaults,
    // don't enable it for binary compatibility
    //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
    //          Trace((stderr, "inflate.c too far\n"));
    //          copy -= state.whave;
    //          if (copy > state.length) { copy = state.length; }
    //          if (copy > left) { copy = left; }
    //          left -= copy;
    //          state.length -= copy;
    //          do {
    //            output[put++] = 0;
    //          } while (--copy);
    //          if (state.length === 0) { state.mode = LEN; }
    //          break;
    //#endif
              }
              if (copy > state.wnext) {
                copy -= state.wnext;
                from = state.wsize - copy;
              }
              else {
                from = state.wnext - copy;
              }
              if (copy > state.length) { copy = state.length; }
              from_source = state.window;
            }
            else {                              /* copy from output */
              from_source = output;
              from = put - state.offset;
              copy = state.length;
            }
            if (copy > left) { copy = left; }
            left -= copy;
            state.length -= copy;
            do {
              output[put++] = from_source[from++];
            } while (--copy);
            if (state.length === 0) { state.mode = LEN; }
            break;
          case LIT:
            if (left === 0) { break inf_leave; }
            output[put++] = state.length;
            left--;
            state.mode = LEN;
            break;
          case CHECK:
            if (state.wrap) {
              //=== NEEDBITS(32);
              while (bits < 32) {
                if (have === 0) { break inf_leave; }
                have--;
                // Use '|' instead of '+' to make sure that result is signed
                hold |= input[next++] << bits;
                bits += 8;
              }
              //===//
              _out -= left;
              strm.total_out += _out;
              state.total += _out;
              if ((state.wrap & 4) && _out) {
                strm.adler = state.check =
                    /*UPDATE_CHECK(state.check, put - _out, _out);*/
                    (state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out));

              }
              _out = left;
              // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
              if ((state.wrap & 4) && (state.flags ? hold : zswap32(hold)) !== state.check) {
                strm.msg = 'incorrect data check';
                state.mode = BAD;
                break;
              }
              //=== INITBITS();
              hold = 0;
              bits = 0;
              //===//
              //Tracev((stderr, "inflate:   check matches trailer\n"));
            }
            state.mode = LENGTH;
            /* falls through */
          case LENGTH:
            if (state.wrap && state.flags) {
              //=== NEEDBITS(32);
              while (bits < 32) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              if ((state.wrap & 4) && hold !== (state.total & 0xffffffff)) {
                strm.msg = 'incorrect length check';
                state.mode = BAD;
                break;
              }
              //=== INITBITS();
              hold = 0;
              bits = 0;
              //===//
              //Tracev((stderr, "inflate:   length matches trailer\n"));
            }
            state.mode = DONE;
            /* falls through */
          case DONE:
            ret = Z_STREAM_END$1;
            break inf_leave;
          case BAD:
            ret = Z_DATA_ERROR$1;
            break inf_leave;
          case MEM:
            return Z_MEM_ERROR$1;
          case SYNC:
            /* falls through */
          default:
            return Z_STREAM_ERROR$1;
        }
      }

      // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

      /*
         Return from inflate(), updating the total counts and the check value.
         If there was no progress during the inflate() call, return a buffer
         error.  Call updatewindow() to create and/or update the window state.
         Note: a memory error from inflate() is non-recoverable.
       */

      //--- RESTORE() ---
      strm.next_out = put;
      strm.avail_out = left;
      strm.next_in = next;
      strm.avail_in = have;
      state.hold = hold;
      state.bits = bits;
      //---

      if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                          (state.mode < CHECK || flush !== Z_FINISH$1))) {
        if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
      }
      _in -= strm.avail_in;
      _out -= strm.avail_out;
      strm.total_in += _in;
      strm.total_out += _out;
      state.total += _out;
      if ((state.wrap & 4) && _out) {
        strm.adler = state.check = /*UPDATE_CHECK(state.check, strm.next_out - _out, _out);*/
          (state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out));
      }
      strm.data_type = state.bits + (state.last ? 64 : 0) +
                        (state.mode === TYPE ? 128 : 0) +
                        (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
      if (((_in === 0 && _out === 0) || flush === Z_FINISH$1) && ret === Z_OK$1) {
        ret = Z_BUF_ERROR;
      }
      return ret;
    };


    const inflateEnd = (strm) => {

      if (inflateStateCheck(strm)) {
        return Z_STREAM_ERROR$1;
      }

      let state = strm.state;
      if (state.window) {
        state.window = null;
      }
      strm.state = null;
      return Z_OK$1;
    };


    const inflateGetHeader = (strm, head) => {

      /* check state */
      if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
      const state = strm.state;
      if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR$1; }

      /* save header structure */
      state.head = head;
      head.done = false;
      return Z_OK$1;
    };


    const inflateSetDictionary = (strm, dictionary) => {
      const dictLength = dictionary.length;

      let state;
      let dictid;
      let ret;

      /* check state */
      if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
      state = strm.state;

      if (state.wrap !== 0 && state.mode !== DICT) {
        return Z_STREAM_ERROR$1;
      }

      /* check for correct dictionary identifier */
      if (state.mode === DICT) {
        dictid = 1; /* adler32(0, null, 0)*/
        /* dictid = adler32(dictid, dictionary, dictLength); */
        dictid = adler32_1(dictid, dictionary, dictLength, 0);
        if (dictid !== state.check) {
          return Z_DATA_ERROR$1;
        }
      }
      /* copy dictionary to window using updatewindow(), which will amend the
       existing dictionary if appropriate */
      ret = updatewindow(strm, dictionary, dictLength, dictLength);
      if (ret) {
        state.mode = MEM;
        return Z_MEM_ERROR$1;
      }
      state.havedict = 1;
      // Tracev((stderr, "inflate:   dictionary set\n"));
      return Z_OK$1;
    };


    var inflateReset_1 = inflateReset;
    var inflateReset2_1 = inflateReset2;
    var inflateResetKeep_1 = inflateResetKeep;
    var inflateInit_1 = inflateInit;
    var inflateInit2_1 = inflateInit2;
    var inflate_2$1 = inflate$2;
    var inflateEnd_1 = inflateEnd;
    var inflateGetHeader_1 = inflateGetHeader;
    var inflateSetDictionary_1 = inflateSetDictionary;
    var inflateInfo = 'pako inflate (from Nodeca project)';

    /* Not implemented
    module.exports.inflateCodesUsed = inflateCodesUsed;
    module.exports.inflateCopy = inflateCopy;
    module.exports.inflateGetDictionary = inflateGetDictionary;
    module.exports.inflateMark = inflateMark;
    module.exports.inflatePrime = inflatePrime;
    module.exports.inflateSync = inflateSync;
    module.exports.inflateSyncPoint = inflateSyncPoint;
    module.exports.inflateUndermine = inflateUndermine;
    module.exports.inflateValidate = inflateValidate;
    */

    var inflate_1$2 = {
    	inflateReset: inflateReset_1,
    	inflateReset2: inflateReset2_1,
    	inflateResetKeep: inflateResetKeep_1,
    	inflateInit: inflateInit_1,
    	inflateInit2: inflateInit2_1,
    	inflate: inflate_2$1,
    	inflateEnd: inflateEnd_1,
    	inflateGetHeader: inflateGetHeader_1,
    	inflateSetDictionary: inflateSetDictionary_1,
    	inflateInfo: inflateInfo
    };

    // (C) 1995-2013 Jean-loup Gailly and Mark Adler
    // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
    //
    // This software is provided 'as-is', without any express or implied
    // warranty. In no event will the authors be held liable for any damages
    // arising from the use of this software.
    //
    // Permission is granted to anyone to use this software for any purpose,
    // including commercial applications, and to alter it and redistribute it
    // freely, subject to the following restrictions:
    //
    // 1. The origin of this software must not be misrepresented; you must not
    //   claim that you wrote the original software. If you use this software
    //   in a product, an acknowledgment in the product documentation would be
    //   appreciated but is not required.
    // 2. Altered source versions must be plainly marked as such, and must not be
    //   misrepresented as being the original software.
    // 3. This notice may not be removed or altered from any source distribution.

    function GZheader() {
      /* true if compressed data believed to be text */
      this.text       = 0;
      /* modification time */
      this.time       = 0;
      /* extra flags (not used when writing a gzip file) */
      this.xflags     = 0;
      /* operating system */
      this.os         = 0;
      /* pointer to extra field or Z_NULL if none */
      this.extra      = null;
      /* extra field length (valid if extra != Z_NULL) */
      this.extra_len  = 0; // Actually, we don't need it in JS,
                           // but leave for few code modifications

      //
      // Setup limits is not necessary because in js we should not preallocate memory
      // for inflate use constant limit in 65536 bytes
      //

      /* space at extra (only when reading header) */
      // this.extra_max  = 0;
      /* pointer to zero-terminated file name or Z_NULL */
      this.name       = '';
      /* space at name (only when reading header) */
      // this.name_max   = 0;
      /* pointer to zero-terminated comment or Z_NULL */
      this.comment    = '';
      /* space at comment (only when reading header) */
      // this.comm_max   = 0;
      /* true if there was or will be a header crc */
      this.hcrc       = 0;
      /* true when done reading gzip header (not used when writing a gzip file) */
      this.done       = false;
    }

    var gzheader = GZheader;

    const toString = Object.prototype.toString;

    /* Public constants ==========================================================*/
    /* ===========================================================================*/

    const {
      Z_NO_FLUSH, Z_FINISH,
      Z_OK, Z_STREAM_END, Z_NEED_DICT, Z_STREAM_ERROR, Z_DATA_ERROR, Z_MEM_ERROR
    } = constants$2;

    /* ===========================================================================*/


    /**
     * class Inflate
     *
     * Generic JS-style wrapper for zlib calls. If you don't need
     * streaming behaviour - use more simple functions: [[inflate]]
     * and [[inflateRaw]].
     **/

    /* internal
     * inflate.chunks -> Array
     *
     * Chunks of output data, if [[Inflate#onData]] not overridden.
     **/

    /**
     * Inflate.result -> Uint8Array|String
     *
     * Uncompressed result, generated by default [[Inflate#onData]]
     * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
     * (call [[Inflate#push]] with `Z_FINISH` / `true` param).
     **/

    /**
     * Inflate.err -> Number
     *
     * Error code after inflate finished. 0 (Z_OK) on success.
     * Should be checked if broken data possible.
     **/

    /**
     * Inflate.msg -> String
     *
     * Error message, if [[Inflate.err]] != 0
     **/


    /**
     * new Inflate(options)
     * - options (Object): zlib inflate options.
     *
     * Creates new inflator instance with specified params. Throws exception
     * on bad params. Supported options:
     *
     * - `windowBits`
     * - `dictionary`
     *
     * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
     * for more information on these.
     *
     * Additional options, for internal needs:
     *
     * - `chunkSize` - size of generated data chunks (16K by default)
     * - `raw` (Boolean) - do raw inflate
     * - `to` (String) - if equal to 'string', then result will be converted
     *   from utf8 to utf16 (javascript) string. When string output requested,
     *   chunk length can differ from `chunkSize`, depending on content.
     *
     * By default, when no options set, autodetect deflate/gzip data format via
     * wrapper header.
     *
     * ##### Example:
     *
     * ```javascript
     * const pako = require('pako')
     * const chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
     * const chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
     *
     * const inflate = new pako.Inflate({ level: 3});
     *
     * inflate.push(chunk1, false);
     * inflate.push(chunk2, true);  // true -> last chunk
     *
     * if (inflate.err) { throw new Error(inflate.err); }
     *
     * console.log(inflate.result);
     * ```
     **/
    function Inflate$1(options) {
      this.options = common.assign({
        chunkSize: 1024 * 64,
        windowBits: 15,
        to: ''
      }, options || {});

      const opt = this.options;

      // Force window size for `raw` data, if not set directly,
      // because we have no header for autodetect.
      if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
        opt.windowBits = -opt.windowBits;
        if (opt.windowBits === 0) { opt.windowBits = -15; }
      }

      // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
      if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
          !(options && options.windowBits)) {
        opt.windowBits += 32;
      }

      // Gzip header has no info about windows size, we can do autodetect only
      // for deflate. So, if window size not set, force it to max when gzip possible
      if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
        // bit 3 (16) -> gzipped data
        // bit 4 (32) -> autodetect gzip/deflate
        if ((opt.windowBits & 15) === 0) {
          opt.windowBits |= 15;
        }
      }

      this.err    = 0;      // error code, if happens (0 = Z_OK)
      this.msg    = '';     // error message
      this.ended  = false;  // used to avoid multiple onEnd() calls
      this.chunks = [];     // chunks of compressed data

      this.strm   = new zstream();
      this.strm.avail_out = 0;

      let status  = inflate_1$2.inflateInit2(
        this.strm,
        opt.windowBits
      );

      if (status !== Z_OK) {
        throw new Error(messages[status]);
      }

      this.header = new gzheader();

      inflate_1$2.inflateGetHeader(this.strm, this.header);

      // Setup dictionary
      if (opt.dictionary) {
        // Convert data if needed
        if (typeof opt.dictionary === 'string') {
          opt.dictionary = strings.string2buf(opt.dictionary);
        } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
          opt.dictionary = new Uint8Array(opt.dictionary);
        }
        if (opt.raw) { //In raw mode we need to set the dictionary early
          status = inflate_1$2.inflateSetDictionary(this.strm, opt.dictionary);
          if (status !== Z_OK) {
            throw new Error(messages[status]);
          }
        }
      }
    }

    /**
     * Inflate#push(data[, flush_mode]) -> Boolean
     * - data (Uint8Array|ArrayBuffer): input data
     * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
     *   flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
     *   `true` means Z_FINISH.
     *
     * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
     * new output chunks. Returns `true` on success. If end of stream detected,
     * [[Inflate#onEnd]] will be called.
     *
     * `flush_mode` is not needed for normal operation, because end of stream
     * detected automatically. You may try to use it for advanced things, but
     * this functionality was not tested.
     *
     * On fail call [[Inflate#onEnd]] with error code and return false.
     *
     * ##### Example
     *
     * ```javascript
     * push(chunk, false); // push one of data chunks
     * ...
     * push(chunk, true);  // push last chunk
     * ```
     **/
    Inflate$1.prototype.push = function (data, flush_mode) {
      const strm = this.strm;
      const chunkSize = this.options.chunkSize;
      const dictionary = this.options.dictionary;
      let status, _flush_mode, last_avail_out;

      if (this.ended) return false;

      if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
      else _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;

      // Convert data if needed
      if (toString.call(data) === '[object ArrayBuffer]') {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }

      strm.next_in = 0;
      strm.avail_in = strm.input.length;

      for (;;) {
        if (strm.avail_out === 0) {
          strm.output = new Uint8Array(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }

        status = inflate_1$2.inflate(strm, _flush_mode);

        if (status === Z_NEED_DICT && dictionary) {
          status = inflate_1$2.inflateSetDictionary(strm, dictionary);

          if (status === Z_OK) {
            status = inflate_1$2.inflate(strm, _flush_mode);
          } else if (status === Z_DATA_ERROR) {
            // Replace code with more verbose
            status = Z_NEED_DICT;
          }
        }

        // Skip snyc markers if more data follows and not raw mode
        while (strm.avail_in > 0 &&
               status === Z_STREAM_END &&
               strm.state.wrap > 0 &&
               data[strm.next_in] !== 0)
        {
          inflate_1$2.inflateReset(strm);
          status = inflate_1$2.inflate(strm, _flush_mode);
        }

        switch (status) {
          case Z_STREAM_ERROR:
          case Z_DATA_ERROR:
          case Z_NEED_DICT:
          case Z_MEM_ERROR:
            this.onEnd(status);
            this.ended = true;
            return false;
        }

        // Remember real `avail_out` value, because we may patch out buffer content
        // to align utf8 strings boundaries.
        last_avail_out = strm.avail_out;

        if (strm.next_out) {
          if (strm.avail_out === 0 || status === Z_STREAM_END) {

            if (this.options.to === 'string') {

              let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

              let tail = strm.next_out - next_out_utf8;
              let utf8str = strings.buf2string(strm.output, next_out_utf8);

              // move tail & realign counters
              strm.next_out = tail;
              strm.avail_out = chunkSize - tail;
              if (tail) strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);

              this.onData(utf8str);

            } else {
              this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
            }
          }
        }

        // Must repeat iteration if out buffer is full
        if (status === Z_OK && last_avail_out === 0) continue;

        // Finalize if end of stream reached.
        if (status === Z_STREAM_END) {
          status = inflate_1$2.inflateEnd(this.strm);
          this.onEnd(status);
          this.ended = true;
          return true;
        }

        if (strm.avail_in === 0) break;
      }

      return true;
    };


    /**
     * Inflate#onData(chunk) -> Void
     * - chunk (Uint8Array|String): output data. When string output requested,
     *   each chunk will be string.
     *
     * By default, stores data blocks in `chunks[]` property and glue
     * those in `onEnd`. Override this handler, if you need another behaviour.
     **/
    Inflate$1.prototype.onData = function (chunk) {
      this.chunks.push(chunk);
    };


    /**
     * Inflate#onEnd(status) -> Void
     * - status (Number): inflate status. 0 (Z_OK) on success,
     *   other if not.
     *
     * Called either after you tell inflate that the input stream is
     * complete (Z_FINISH). By default - join collected chunks,
     * free memory and fill `results` / `err` properties.
     **/
    Inflate$1.prototype.onEnd = function (status) {
      // On success - join
      if (status === Z_OK) {
        if (this.options.to === 'string') {
          this.result = this.chunks.join('');
        } else {
          this.result = common.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status;
      this.msg = this.strm.msg;
    };


    /**
     * inflate(data[, options]) -> Uint8Array|String
     * - data (Uint8Array|ArrayBuffer): input data to decompress.
     * - options (Object): zlib inflate options.
     *
     * Decompress `data` with inflate/ungzip and `options`. Autodetect
     * format via wrapper header by default. That's why we don't provide
     * separate `ungzip` method.
     *
     * Supported options are:
     *
     * - windowBits
     *
     * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
     * for more information.
     *
     * Sugar (options):
     *
     * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
     *   negative windowBits implicitly.
     * - `to` (String) - if equal to 'string', then result will be converted
     *   from utf8 to utf16 (javascript) string. When string output requested,
     *   chunk length can differ from `chunkSize`, depending on content.
     *
     *
     * ##### Example:
     *
     * ```javascript
     * const pako = require('pako');
     * const input = pako.deflate(new Uint8Array([1,2,3,4,5,6,7,8,9]));
     * let output;
     *
     * try {
     *   output = pako.inflate(input);
     * } catch (err) {
     *   console.log(err);
     * }
     * ```
     **/
    function inflate$1(input, options) {
      const inflator = new Inflate$1(options);

      inflator.push(input);

      // That will never happens, if you don't cheat with options :)
      if (inflator.err) throw inflator.msg || messages[inflator.err];

      return inflator.result;
    }


    /**
     * inflateRaw(data[, options]) -> Uint8Array|String
     * - data (Uint8Array|ArrayBuffer): input data to decompress.
     * - options (Object): zlib inflate options.
     *
     * The same as [[inflate]], but creates raw data, without wrapper
     * (header and adler32 crc).
     **/
    function inflateRaw$1(input, options) {
      options = options || {};
      options.raw = true;
      return inflate$1(input, options);
    }


    /**
     * ungzip(data[, options]) -> Uint8Array|String
     * - data (Uint8Array|ArrayBuffer): input data to decompress.
     * - options (Object): zlib inflate options.
     *
     * Just shortcut to [[inflate]], because it autodetects format
     * by header.content. Done for convenience.
     **/


    var Inflate_1$1 = Inflate$1;
    var inflate_2 = inflate$1;
    var inflateRaw_1$1 = inflateRaw$1;
    var ungzip$1 = inflate$1;
    var constants = constants$2;

    var inflate_1$1 = {
    	Inflate: Inflate_1$1,
    	inflate: inflate_2,
    	inflateRaw: inflateRaw_1$1,
    	ungzip: ungzip$1,
    	constants: constants
    };

    const { Deflate, deflate, deflateRaw, gzip } = deflate_1$1;

    const { Inflate, inflate, inflateRaw, ungzip } = inflate_1$1;



    var Deflate_1 = Deflate;
    var deflate_1 = deflate;
    var deflateRaw_1 = deflateRaw;
    var gzip_1 = gzip;
    var Inflate_1 = Inflate;
    var inflate_1 = inflate;
    var inflateRaw_1 = inflateRaw;
    var ungzip_1 = ungzip;
    var constants_1 = constants$2;

    var pako = {
    	Deflate: Deflate_1,
    	deflate: deflate_1,
    	deflateRaw: deflateRaw_1,
    	gzip: gzip_1,
    	Inflate: Inflate_1,
    	inflate: inflate_1,
    	inflateRaw: inflateRaw_1,
    	ungzip: ungzip_1,
    	constants: constants_1
    };

    const _key = 'pieces';

    async function compress(object) {
        return pako.deflate(JSON.stringify(object), { level: 9 })
    }

    function decompress(string) {
        return JSON.parse(pako.inflate(string, { to: 'string' }), { level: 9 })
    }

    function remainingSize() {
        let totalStorage = 0;
        let keyLength;

        for (let key in localStorage) {
            if (!localStorage.hasOwnProperty(key)) continue
            
            keyLength = (localStorage[key].length + key.length);
            totalStorage += keyLength;
        }

        return (totalStorage / 1024).toFixed(2)
    }

    async function piece(name, settings, data, skip_compression = false) {
        // console.log(skip_compression)
        return {
            name: name,
            settings: settings,
            updated: Date.now(),
            data: skip_compression ? data : await compress(data)
        }
    }

    const module = {
        getAll: () => {
            let pieces = JSON.parse(localStorage.getItem(_key));
            if (!pieces)
                pieces = [];

            return pieces
        },

        add: async (name, settings, json, skip_compression = false) => {
            let pieces = module.getAll();

            let thisPieceRemoved = pieces.filter((entry) => entry.name != name);
            thisPieceRemoved.unshift(await piece(name, settings, json, skip_compression));

            try {
                localStorage.setItem(_key, JSON.stringify(thisPieceRemoved));
            } catch ({ error, message }) {
                if (error == "QuotaExceededError" || message == "The quota has been exceeded.") {
                    console.log("Quota exceeded, dropping: ", thisPieceRemoved.pop());
                    thisPieceRemoved.shift(); // undo addition
                    localStorage.setItem(_key, JSON.stringify(thisPieceRemoved));
                    module.add(name, settings, json, skip_compression);
                }
                else console.error(error, message);
            }
        },

        export: async (name) => {
            let pieces = module.getAll();
            let thisPiece = pieces.filter((entry) => entry.name === name)[0];

            return thisPiece
        },

        delete: (name) => {
            let pieces = module.getAll().filter((entry) => entry.name != name);
            localStorage.setItem(_key, JSON.stringify(pieces));
        }
    };

    /**
     * @name toDate
     * @category Common Helpers
     * @summary Convert the given argument to an instance of Date.
     *
     * @description
     * Convert the given argument to an instance of Date.
     *
     * If the argument is an instance of Date, the function returns its clone.
     *
     * If the argument is a number, it is treated as a timestamp.
     *
     * If the argument is none of the above, the function returns Invalid Date.
     *
     * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param argument - The value to convert
     *
     * @returns The parsed date in the local time zone
     *
     * @example
     * // Clone the date:
     * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
     * //=> Tue Feb 11 2014 11:30:30
     *
     * @example
     * // Convert the timestamp to date:
     * const result = toDate(1392098430000)
     * //=> Tue Feb 11 2014 11:30:30
     */
    function toDate(argument) {
      const argStr = Object.prototype.toString.call(argument);

      // Clone the date
      if (
        argument instanceof Date ||
        (typeof argument === "object" && argStr === "[object Date]")
      ) {
        // Prevent the date to lose the milliseconds when passed to new Date() in IE10
        return new argument.constructor(+argument);
      } else if (
        typeof argument === "number" ||
        argStr === "[object Number]" ||
        typeof argument === "string" ||
        argStr === "[object String]"
      ) {
        // TODO: Can we get rid of as?
        return new Date(argument);
      } else {
        // TODO: Can we get rid of as?
        return new Date(NaN);
      }
    }

    /**
     * @module constants
     * @summary Useful constants
     * @description
     * Collection of useful date constants.
     *
     * The constants could be imported from `date-fns/constants`:
     *
     * ```ts
     * import { maxTime, minTime } from "./constants/date-fns/constants";
     *
     * function isAllowedTime(time) {
     *   return time <= maxTime && time >= minTime;
     * }
     * ```
     */

    /**
     * @constant
     * @name daysInYear
     * @summary Days in 1 year.
     *
     * @description
     * How many days in a year.
     *
     * One years equals 365.2425 days according to the formula:
     *
     * > Leap year occures every 4 years, except for years that are divisable by 100 and not divisable by 400.
     * > 1 mean year = (365+1/4-1/100+1/400) days = 365.2425 days
     */
    const daysInYear = 365.2425;

    /**
     * @constant
     * @name millisecondsInWeek
     * @summary Milliseconds in 1 week.
     */
    const millisecondsInWeek = 604800000;

    /**
     * @constant
     * @name millisecondsInDay
     * @summary Milliseconds in 1 day.
     */
    const millisecondsInDay = 86400000;

    /**
     * @constant
     * @name millisecondsInMinute
     * @summary Milliseconds in 1 minute
     */
    const millisecondsInMinute = 60000;

    /**
     * @constant
     * @name millisecondsInHour
     * @summary Milliseconds in 1 hour
     */
    const millisecondsInHour = 3600000;

    /**
     * @constant
     * @name secondsInHour
     * @summary Seconds in 1 hour.
     */
    const secondsInHour = 3600;

    /**
     * @constant
     * @name secondsInMinute
     * @summary Seconds in 1 minute.
     */
    const secondsInMinute = 60;

    /**
     * @constant
     * @name secondsInDay
     * @summary Seconds in 1 day.
     */
    const secondsInDay = secondsInHour * 24;

    /**
     * @constant
     * @name secondsInWeek
     * @summary Seconds in 1 week.
     */
    const secondsInWeek = secondsInDay * 7;

    /**
     * @constant
     * @name secondsInYear
     * @summary Seconds in 1 year.
     */
    const secondsInYear = secondsInDay * daysInYear;

    /**
     * @constant
     * @name secondsInMonth
     * @summary Seconds in 1 month
     */
    const secondsInMonth = secondsInYear / 12;

    /**
     * @constant
     * @name secondsInQuarter
     * @summary Seconds in 1 quarter.
     */
    const secondsInQuarter = secondsInMonth * 3;

    let defaultOptions = {};

    function getDefaultOptions() {
      return defaultOptions;
    }

    /**
     * The {@link startOfWeek} function options.
     */

    /**
     * @name startOfWeek
     * @category Week Helpers
     * @summary Return the start of a week for the given date.
     *
     * @description
     * Return the start of a week for the given date.
     * The result will be in the local timezone.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param date - The original date
     * @param options - An object with options
     *
     * @returns The start of a week
     *
     * @example
     * // The start of a week for 2 September 2014 11:55:00:
     * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Sun Aug 31 2014 00:00:00
     *
     * @example
     * // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
     * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
     * //=> Mon Sep 01 2014 00:00:00
     */
    function startOfWeek(date, options) {
      const defaultOptions = getDefaultOptions();
      const weekStartsOn =
        options?.weekStartsOn ??
        options?.locale?.options?.weekStartsOn ??
        defaultOptions.weekStartsOn ??
        defaultOptions.locale?.options?.weekStartsOn ??
        0;

      const _date = toDate(date);
      const day = _date.getDay();
      const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

      _date.setDate(_date.getDate() - diff);
      _date.setHours(0, 0, 0, 0);
      return _date;
    }

    /**
     * @name startOfDay
     * @category Day Helpers
     * @summary Return the start of a day for the given date.
     *
     * @description
     * Return the start of a day for the given date.
     * The result will be in the local timezone.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param date - The original date
     *
     * @returns The start of a day
     *
     * @example
     * // The start of a day for 2 September 2014 11:55:00:
     * const result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Tue Sep 02 2014 00:00:00
     */
    function startOfDay(date) {
      const _date = toDate(date);
      _date.setHours(0, 0, 0, 0);
      return _date;
    }

    /**
     * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
     * They usually appear for dates that denote time before the timezones were introduced
     * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
     * and GMT+01:00:00 after that date)
     *
     * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
     * which would lead to incorrect calculations.
     *
     * This function returns the timezone offset in milliseconds that takes seconds in account.
     */
    function getTimezoneOffsetInMilliseconds(date) {
      const _date = toDate(date);
      const utcDate = new Date(
        Date.UTC(
          _date.getFullYear(),
          _date.getMonth(),
          _date.getDate(),
          _date.getHours(),
          _date.getMinutes(),
          _date.getSeconds(),
          _date.getMilliseconds(),
        ),
      );
      utcDate.setUTCFullYear(_date.getFullYear());
      return +date - +utcDate;
    }

    /**
     * @name differenceInCalendarDays
     * @category Day Helpers
     * @summary Get the number of calendar days between the given dates.
     *
     * @description
     * Get the number of calendar days between the given dates. This means that the times are removed
     * from the dates and then the difference in days is calculated.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param dateLeft - The later date
     * @param dateRight - The earlier date
     *
     * @returns The number of calendar days
     *
     * @example
     * // How many calendar days are between
     * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
     * const result = differenceInCalendarDays(
     *   new Date(2012, 6, 2, 0, 0),
     *   new Date(2011, 6, 2, 23, 0)
     * )
     * //=> 366
     * // How many calendar days are between
     * // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
     * const result = differenceInCalendarDays(
     *   new Date(2011, 6, 3, 0, 1),
     *   new Date(2011, 6, 2, 23, 59)
     * )
     * //=> 1
     */
    function differenceInCalendarDays(dateLeft, dateRight) {
      const startOfDayLeft = startOfDay(dateLeft);
      const startOfDayRight = startOfDay(dateRight);

      const timestampLeft =
        +startOfDayLeft - getTimezoneOffsetInMilliseconds(startOfDayLeft);
      const timestampRight =
        +startOfDayRight - getTimezoneOffsetInMilliseconds(startOfDayRight);

      // Round the number of days to the nearest integer because the number of
      // milliseconds in a day is not constant (e.g. it's different in the week of
      // the daylight saving time clock shift).
      return Math.round((timestampLeft - timestampRight) / millisecondsInDay);
    }

    /**
     * @name differenceInCalendarMonths
     * @category Month Helpers
     * @summary Get the number of calendar months between the given dates.
     *
     * @description
     * Get the number of calendar months between the given dates.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param dateLeft - The later date
     * @param dateRight - The earlier date
     *
     * @returns The number of calendar months
     *
     * @example
     * // How many calendar months are between 31 January 2014 and 1 September 2014?
     * const result = differenceInCalendarMonths(
     *   new Date(2014, 8, 1),
     *   new Date(2014, 0, 31)
     * )
     * //=> 8
     */
    function differenceInCalendarMonths(dateLeft, dateRight) {
      const _dateLeft = toDate(dateLeft);
      const _dateRight = toDate(dateRight);

      const yearDiff = _dateLeft.getFullYear() - _dateRight.getFullYear();
      const monthDiff = _dateLeft.getMonth() - _dateRight.getMonth();

      return yearDiff * 12 + monthDiff;
    }

    /**
     * @name getQuarter
     * @category Quarter Helpers
     * @summary Get the year quarter of the given date.
     *
     * @description
     * Get the year quarter of the given date.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param date - The given date
     *
     * @returns The quarter
     *
     * @example
     * // Which quarter is 2 July 2014?
     * const result = getQuarter(new Date(2014, 6, 2))
     * //=> 3
     */
    function getQuarter(date) {
      const _date = toDate(date);
      const quarter = Math.trunc(_date.getMonth() / 3) + 1;
      return quarter;
    }

    /**
     * @name differenceInCalendarQuarters
     * @category Quarter Helpers
     * @summary Get the number of calendar quarters between the given dates.
     *
     * @description
     * Get the number of calendar quarters between the given dates.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param dateLeft - The later date
     * @param dateRight - The earlier date

     * @returns The number of calendar quarters
     *
     * @example
     * // How many calendar quarters are between 31 December 2013 and 2 July 2014?
     * const result = differenceInCalendarQuarters(
     *   new Date(2014, 6, 2),
     *   new Date(2013, 11, 31)
     * )
     * //=> 3
     */
    function differenceInCalendarQuarters(dateLeft, dateRight) {
      const _dateLeft = toDate(dateLeft);
      const _dateRight = toDate(dateRight);

      const yearDiff = _dateLeft.getFullYear() - _dateRight.getFullYear();
      const quarterDiff = getQuarter(_dateLeft) - getQuarter(_dateRight);

      return yearDiff * 4 + quarterDiff;
    }

    /**
     * The {@link differenceInCalendarWeeks} function options.
     */

    /**
     * @name differenceInCalendarWeeks
     * @category Week Helpers
     * @summary Get the number of calendar weeks between the given dates.
     *
     * @description
     * Get the number of calendar weeks between the given dates.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param dateLeft - The later date
     * @param dateRight - The earlier date
     * @param options - An object with options.
     *
     * @returns The number of calendar weeks
     *
     * @example
     * // How many calendar weeks are between 5 July 2014 and 20 July 2014?
     * const result = differenceInCalendarWeeks(
     *   new Date(2014, 6, 20),
     *   new Date(2014, 6, 5)
     * )
     * //=> 3
     *
     * @example
     * // If the week starts on Monday,
     * // how many calendar weeks are between 5 July 2014 and 20 July 2014?
     * const result = differenceInCalendarWeeks(
     *   new Date(2014, 6, 20),
     *   new Date(2014, 6, 5),
     *   { weekStartsOn: 1 }
     * )
     * //=> 2
     */
    function differenceInCalendarWeeks(dateLeft, dateRight, options) {
      const startOfWeekLeft = startOfWeek(dateLeft, options);
      const startOfWeekRight = startOfWeek(dateRight, options);

      const timestampLeft =
        +startOfWeekLeft - getTimezoneOffsetInMilliseconds(startOfWeekLeft);
      const timestampRight =
        +startOfWeekRight - getTimezoneOffsetInMilliseconds(startOfWeekRight);

      // Round the number of days to the nearest integer because the number of
      // milliseconds in a days is not constant (e.g. it's different in the week of
      // the daylight saving time clock shift).
      return Math.round((timestampLeft - timestampRight) / millisecondsInWeek);
    }

    /**
     * @name differenceInCalendarYears
     * @category Year Helpers
     * @summary Get the number of calendar years between the given dates.
     *
     * @description
     * Get the number of calendar years between the given dates.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param dateLeft - The later date
     * @param dateRight - The earlier date

     * @returns The number of calendar years
     *
     * @example
     * // How many calendar years are between 31 December 2013 and 11 February 2015?
     * const result = differenceInCalendarYears(
     *   new Date(2015, 1, 11),
     *   new Date(2013, 11, 31)
     * )
     * //=> 2
     */
    function differenceInCalendarYears(dateLeft, dateRight) {
      const _dateLeft = toDate(dateLeft);
      const _dateRight = toDate(dateRight);

      return _dateLeft.getFullYear() - _dateRight.getFullYear();
    }

    function getRoundingMethod(method) {
      return (number) => {
        const round = method ? Math[method] : Math.trunc;
        const result = round(number);
        // Prevent negative zero
        return result === 0 ? 0 : result;
      };
    }

    /**
     * @name differenceInMilliseconds
     * @category Millisecond Helpers
     * @summary Get the number of milliseconds between the given dates.
     *
     * @description
     * Get the number of milliseconds between the given dates.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param dateLeft - The later date
     * @param dateRight - The earlier date
     *
     * @returns The number of milliseconds
     *
     * @example
     * // How many milliseconds are between
     * // 2 July 2014 12:30:20.600 and 2 July 2014 12:30:21.700?
     * const result = differenceInMilliseconds(
     *   new Date(2014, 6, 2, 12, 30, 21, 700),
     *   new Date(2014, 6, 2, 12, 30, 20, 600)
     * )
     * //=> 1100
     */
    function differenceInMilliseconds(dateLeft, dateRight) {
      return +toDate(dateLeft) - +toDate(dateRight);
    }

    /**
     * The {@link differenceInHours} function options.
     */

    /**
     * @name differenceInHours
     * @category Hour Helpers
     * @summary Get the number of hours between the given dates.
     *
     * @description
     * Get the number of hours between the given dates.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param dateLeft - The later date
     * @param dateRight - The earlier date
     * @param options - An object with options.
     *
     * @returns The number of hours
     *
     * @example
     * // How many hours are between 2 July 2014 06:50:00 and 2 July 2014 19:00:00?
     * const result = differenceInHours(
     *   new Date(2014, 6, 2, 19, 0),
     *   new Date(2014, 6, 2, 6, 50)
     * )
     * //=> 12
     */
    function differenceInHours(dateLeft, dateRight, options) {
      const diff =
        differenceInMilliseconds(dateLeft, dateRight) / millisecondsInHour;
      return getRoundingMethod(options?.roundingMethod)(diff);
    }

    /**
     * The {@link differenceInMinutes} function options.
     */

    /**
     * @name differenceInMinutes
     * @category Minute Helpers
     * @summary Get the number of minutes between the given dates.
     *
     * @description
     * Get the signed number of full (rounded towards 0) minutes between the given dates.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param dateLeft - The later date
     * @param dateRight - The earlier date
     * @param options - An object with options.
     *
     * @returns The number of minutes
     *
     * @example
     * // How many minutes are between 2 July 2014 12:07:59 and 2 July 2014 12:20:00?
     * const result = differenceInMinutes(
     *   new Date(2014, 6, 2, 12, 20, 0),
     *   new Date(2014, 6, 2, 12, 7, 59)
     * )
     * //=> 12
     *
     * @example
     * // How many minutes are between 10:01:59 and 10:00:00
     * const result = differenceInMinutes(
     *   new Date(2000, 0, 1, 10, 0, 0),
     *   new Date(2000, 0, 1, 10, 1, 59)
     * )
     * //=> -1
     */
    function differenceInMinutes(dateLeft, dateRight, options) {
      const diff =
        differenceInMilliseconds(dateLeft, dateRight) / millisecondsInMinute;
      return getRoundingMethod(options?.roundingMethod)(diff);
    }

    /**
     * The {@link differenceInSeconds} function options.
     */

    /**
     * @name differenceInSeconds
     * @category Second Helpers
     * @summary Get the number of seconds between the given dates.
     *
     * @description
     * Get the number of seconds between the given dates.
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param dateLeft - The later date
     * @param dateRight - The earlier date
     * @param options - An object with options.
     *
     * @returns The number of seconds
     *
     * @example
     * // How many seconds are between
     * // 2 July 2014 12:30:07.999 and 2 July 2014 12:30:20.000?
     * const result = differenceInSeconds(
     *   new Date(2014, 6, 2, 12, 30, 20, 0),
     *   new Date(2014, 6, 2, 12, 30, 7, 999)
     * )
     * //=> 12
     */
    function differenceInSeconds(dateLeft, dateRight, options) {
      const diff = differenceInMilliseconds(dateLeft, dateRight) / 1000;
      return getRoundingMethod(options?.roundingMethod)(diff);
    }

    /**
     * The {@link intlFormatDistance} function options.
     */

    /**
     * The unit used to format the distance in {@link intlFormatDistance}.
     */

    /**
     * @name intlFormatDistance
     * @category Common Helpers
     * @summary Formats distance between two dates in a human-readable format
     * @description
     * The function calculates the difference between two dates and formats it as a human-readable string.
     *
     * The function will pick the most appropriate unit depending on the distance between dates. For example, if the distance is a few hours, it might return `x hours`. If the distance is a few months, it might return `x months`.
     *
     * You can also specify a unit to force using it regardless of the distance to get a result like `123456 hours`.
     *
     * See the table below for the unit picking logic:
     *
     * | Distance between dates | Result (past)  | Result (future) |
     * | ---------------------- | -------------- | --------------- |
     * | 0 seconds              | now            | now             |
     * | 1-59 seconds           | X seconds ago  | in X seconds    |
     * | 1-59 minutes           | X minutes ago  | in X minutes    |
     * | 1-23 hours             | X hours ago    | in X hours      |
     * | 1 day                  | yesterday      | tomorrow        |
     * | 2-6 days               | X days ago     | in X days       |
     * | 7 days                 | last week      | next week       |
     * | 8 days-1 month         | X weeks ago    | in X weeks      |
     * | 1 month                | last month     | next month      |
     * | 2-3 months             | X months ago   | in X months     |
     * | 1 quarter              | last quarter   | next quarter    |
     * | 2-3 quarters           | X quarters ago | in X quarters   |
     * | 1 year                 | last year      | next year       |
     * | 2+ years               | X years ago    | in X years      |
     *
     * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
     *
     * @param date - The date
     * @param baseDate - The date to compare with.
     * @param options - An object with options.
     * See MDN for details [Locale identification and negotiation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locale_identification_and_negotiation)
     * The narrow one could be similar to the short one for some locales.
     *
     * @returns The distance in words according to language-sensitive relative time formatting.
     *
     * @throws `date` must not be Invalid Date
     * @throws `baseDate` must not be Invalid Date
     * @throws `options.unit` must not be invalid Unit
     * @throws `options.locale` must not be invalid locale
     * @throws `options.localeMatcher` must not be invalid localeMatcher
     * @throws `options.numeric` must not be invalid numeric
     * @throws `options.style` must not be invalid style
     *
     * @example
     * // What is the distance between the dates when the fist date is after the second?
     * intlFormatDistance(
     *   new Date(1986, 3, 4, 11, 30, 0),
     *   new Date(1986, 3, 4, 10, 30, 0)
     * )
     * //=> 'in 1 hour'
     *
     * // What is the distance between the dates when the fist date is before the second?
     * intlFormatDistance(
     *   new Date(1986, 3, 4, 10, 30, 0),
     *   new Date(1986, 3, 4, 11, 30, 0)
     * )
     * //=> '1 hour ago'
     *
     * @example
     * // Use the unit option to force the function to output the result in quarters. Without setting it, the example would return "next year"
     * intlFormatDistance(
     *   new Date(1987, 6, 4, 10, 30, 0),
     *   new Date(1986, 3, 4, 10, 30, 0),
     *   { unit: 'quarter' }
     * )
     * //=> 'in 5 quarters'
     *
     * @example
     * // Use the locale option to get the result in Spanish. Without setting it, the example would return "in 1 hour".
     * intlFormatDistance(
     *   new Date(1986, 3, 4, 11, 30, 0),
     *   new Date(1986, 3, 4, 10, 30, 0),
     *   { locale: 'es' }
     * )
     * //=> 'dentro de 1 hora'
     *
     * @example
     * // Use the numeric option to force the function to use numeric values. Without setting it, the example would return "tomorrow".
     * intlFormatDistance(
     *   new Date(1986, 3, 5, 11, 30, 0),
     *   new Date(1986, 3, 4, 11, 30, 0),
     *   { numeric: 'always' }
     * )
     * //=> 'in 1 day'
     *
     * @example
     * // Use the style option to force the function to use short values. Without setting it, the example would return "in 2 years".
     * intlFormatDistance(
     *   new Date(1988, 3, 4, 11, 30, 0),
     *   new Date(1986, 3, 4, 11, 30, 0),
     *   { style: 'short' }
     * )
     * //=> 'in 2 yr'
     */
    function intlFormatDistance(date, baseDate, options) {
      let value = 0;
      let unit;
      const dateLeft = toDate(date);
      const dateRight = toDate(baseDate);

      if (!options?.unit) {
        // Get the unit based on diffInSeconds calculations if no unit is specified
        const diffInSeconds = differenceInSeconds(dateLeft, dateRight); // The smallest unit

        if (Math.abs(diffInSeconds) < secondsInMinute) {
          value = differenceInSeconds(dateLeft, dateRight);
          unit = "second";
        } else if (Math.abs(diffInSeconds) < secondsInHour) {
          value = differenceInMinutes(dateLeft, dateRight);
          unit = "minute";
        } else if (
          Math.abs(diffInSeconds) < secondsInDay &&
          Math.abs(differenceInCalendarDays(dateLeft, dateRight)) < 1
        ) {
          value = differenceInHours(dateLeft, dateRight);
          unit = "hour";
        } else if (
          Math.abs(diffInSeconds) < secondsInWeek &&
          (value = differenceInCalendarDays(dateLeft, dateRight)) &&
          Math.abs(value) < 7
        ) {
          unit = "day";
        } else if (Math.abs(diffInSeconds) < secondsInMonth) {
          value = differenceInCalendarWeeks(dateLeft, dateRight);
          unit = "week";
        } else if (Math.abs(diffInSeconds) < secondsInQuarter) {
          value = differenceInCalendarMonths(dateLeft, dateRight);
          unit = "month";
        } else if (Math.abs(diffInSeconds) < secondsInYear) {
          if (differenceInCalendarQuarters(dateLeft, dateRight) < 4) {
            // To filter out cases that are less than a year but match 4 quarters
            value = differenceInCalendarQuarters(dateLeft, dateRight);
            unit = "quarter";
          } else {
            value = differenceInCalendarYears(dateLeft, dateRight);
            unit = "year";
          }
        } else {
          value = differenceInCalendarYears(dateLeft, dateRight);
          unit = "year";
        }
      } else {
        // Get the value if unit is specified
        unit = options?.unit;
        if (unit === "second") {
          value = differenceInSeconds(dateLeft, dateRight);
        } else if (unit === "minute") {
          value = differenceInMinutes(dateLeft, dateRight);
        } else if (unit === "hour") {
          value = differenceInHours(dateLeft, dateRight);
        } else if (unit === "day") {
          value = differenceInCalendarDays(dateLeft, dateRight);
        } else if (unit === "week") {
          value = differenceInCalendarWeeks(dateLeft, dateRight);
        } else if (unit === "month") {
          value = differenceInCalendarMonths(dateLeft, dateRight);
        } else if (unit === "quarter") {
          value = differenceInCalendarQuarters(dateLeft, dateRight);
        } else if (unit === "year") {
          value = differenceInCalendarYears(dateLeft, dateRight);
        }
      }

      const rtf = new Intl.RelativeTimeFormat(options?.locale, {
        localeMatcher: options?.localeMatcher,
        numeric: options?.numeric || "auto",
        style: options?.style,
      });

      return rtf.format(value, unit);
    }

    /* src\components\HistoryEntry.svelte generated by Svelte v3.55.1 */

    const { Object: Object_1 } = globals;
    const file$3 = "src\\components\\HistoryEntry.svelte";

    function create_fragment$3(ctx) {
    	let dialog;
    	let form;
    	let p;
    	let t0;
    	let t1_value = /*piece*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let t3;
    	let div0;
    	let button0;
    	let t5;
    	let button1;
    	let t7;
    	let button2;
    	let t9;
    	let button3;
    	let div1;
    	let t10_value = /*piece*/ ctx[0].name + "";
    	let t10;
    	let t11;
    	let hr;
    	let t12;
    	let div2;
    	let t13_value = intlFormatDistance(/*piece*/ ctx[0].updated, Date.now()) + "";
    	let t13;
    	let t14;
    	let t15_value = Math.round(Object.keys(/*piece*/ ctx[0].data).length * 11.2 / 1024) + "";
    	let t15;
    	let t16;
    	let button3_title_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			dialog = element("dialog");
    			form = element("form");
    			p = element("p");
    			t0 = text("Are you sure that you'd like to delete ");
    			t1 = text(t1_value);
    			t2 = text(" from your history?");
    			t3 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Cancel";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Export and Delete";
    			t7 = space();
    			button2 = element("button");
    			button2.textContent = "Delete";
    			t9 = space();
    			button3 = element("button");
    			div1 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			hr = element("hr");
    			t12 = space();
    			div2 = element("div");
    			t13 = text(t13_value);
    			t14 = text(" - ");
    			t15 = text(t15_value);
    			t16 = text(" kb");
    			attr_dev(p, "class", "p-3 text-center");
    			add_location(p, file$3, 44, 8, 1154);
    			attr_dev(button0, "formmethod", "dialog");
    			attr_dev(button0, "class", "p-1");
    			button0.value = "cancel";
    			add_location(button0, file$3, 48, 12, 1355);
    			attr_dev(button1, "formmethod", "dialog");
    			attr_dev(button1, "class", "p-1");
    			button1.value = "export-and-delete";
    			add_location(button1, file$3, 49, 12, 1438);
    			attr_dev(button2, "formmethod", "dialog");
    			attr_dev(button2, "class", "p-1");
    			button2.value = "delete";
    			add_location(button2, file$3, 50, 12, 1543);
    			attr_dev(div0, "class", "mx-2 mb-2 flex gap-2 w-full justify-center");
    			add_location(div0, file$3, 47, 8, 1286);
    			add_location(form, file$3, 43, 4, 1139);
    			attr_dev(dialog, "class", "rounded-lg overflow-hidden");
    			add_location(dialog, file$3, 41, 0, 1030);
    			set_style(div1, "white-space", "nowrap");
    			set_style(div1, "text-overflow", "ellipsis");
    			set_style(div1, "overflow", "hidden");
    			add_location(div1, file$3, 58, 4, 1953);
    			set_style(hr, "border-top", "1px solid dimgrey", 1);
    			set_style(hr, "width", "100%");
    			attr_dev(hr, "class", "m-1");
    			add_location(hr, file$3, 61, 4, 2084);
    			attr_dev(div2, "class", "italic");
    			add_location(div2, file$3, 62, 4, 2166);
    			attr_dev(button3, "title", button3_title_value = /*piece*/ ctx[0].name);
    			attr_dev(button3, "class", "max-w-64 text-dimgrey justify-center align-middle text-nowrap text-ellipsis overflow-hidden");
    			set_style(button3, "background", "none", 1);
    			set_style(button3, "border", "1px solid dimgrey");
    			add_location(button3, file$3, 55, 0, 1652);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, dialog, anchor);
    			append_dev(dialog, form);
    			append_dev(form, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(form, t3);
    			append_dev(form, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t5);
    			append_dev(div0, button1);
    			append_dev(div0, t7);
    			append_dev(div0, button2);
    			/*dialog_binding*/ ctx[6](dialog);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, button3, anchor);
    			append_dev(button3, div1);
    			append_dev(div1, t10);
    			/*div1_binding*/ ctx[7](div1);
    			append_dev(button3, t11);
    			append_dev(button3, hr);
    			append_dev(button3, t12);
    			append_dev(button3, div2);
    			append_dev(div2, t13);
    			append_dev(div2, t14);
    			append_dev(div2, t15);
    			append_dev(div2, t16);

    			if (!mounted) {
    				dispose = [
    					listen_dev(dialog, "close", /*processDecision*/ ctx[5], false, false, false),
    					listen_dev(button3, "click", /*load*/ ctx[3], false, false, false),
    					listen_dev(button3, "contextmenu", prevent_default(/*remove*/ ctx[4]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*piece*/ 1 && t1_value !== (t1_value = /*piece*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*piece*/ 1 && t10_value !== (t10_value = /*piece*/ ctx[0].name + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*piece*/ 1 && t13_value !== (t13_value = intlFormatDistance(/*piece*/ ctx[0].updated, Date.now()) + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*piece*/ 1 && t15_value !== (t15_value = Math.round(Object.keys(/*piece*/ ctx[0].data).length * 11.2 / 1024) + "")) set_data_dev(t15, t15_value);

    			if (dirty & /*piece*/ 1 && button3_title_value !== (button3_title_value = /*piece*/ ctx[0].name)) {
    				attr_dev(button3, "title", button3_title_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(dialog);
    			/*dialog_binding*/ ctx[6](null);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(button3);
    			/*div1_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots('HistoryEntry', slots, []);
    	let dispatch = createEventDispatcher();
    	let { piece } = $$props;
    	let title; // HTMLElement

    	let wrapOnUnderlines = () => {
    		// does not work :(
    		if (!title) return;

    		$$invalidate(1, title.innerHTML = title.innerHTML.replaceAll('_', '<wbr/>_'), title);
    	};

    	// onMount(wrapOnUnderlines)
    	let load = () => {
    		dispatch('load', { project: piece });
    	};

    	let removalDialog;

    	let remove = () => {
    		removalDialog.showModal();
    	};

    	let processDecision = () => {
    		if (removalDialog.returnValue == "export-and-delete") {
    			dispatch('export');
    			module.delete(piece.name);
    			dispatch('refresh');
    		} else if (removalDialog.returnValue == "delete") {
    			module.delete(piece.name);
    			dispatch('refresh');
    		}
    	};

    	$$self.$$.on_mount.push(function () {
    		if (piece === undefined && !('piece' in $$props || $$self.$$.bound[$$self.$$.props['piece']])) {
    			console.warn("<HistoryEntry> was created without expected prop 'piece'");
    		}
    	});

    	const writable_props = ['piece'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HistoryEntry> was created with unknown prop '${key}'`);
    	});

    	function dialog_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			removalDialog = $$value;
    			$$invalidate(2, removalDialog);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			title = $$value;
    			$$invalidate(1, title);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('piece' in $$props) $$invalidate(0, piece = $$props.piece);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		history: module,
    		intlFormatDistance,
    		onMount,
    		piece,
    		title,
    		wrapOnUnderlines,
    		load,
    		removalDialog,
    		remove,
    		processDecision
    	});

    	$$self.$inject_state = $$props => {
    		if ('dispatch' in $$props) dispatch = $$props.dispatch;
    		if ('piece' in $$props) $$invalidate(0, piece = $$props.piece);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('wrapOnUnderlines' in $$props) wrapOnUnderlines = $$props.wrapOnUnderlines;
    		if ('load' in $$props) $$invalidate(3, load = $$props.load);
    		if ('removalDialog' in $$props) $$invalidate(2, removalDialog = $$props.removalDialog);
    		if ('remove' in $$props) $$invalidate(4, remove = $$props.remove);
    		if ('processDecision' in $$props) $$invalidate(5, processDecision = $$props.processDecision);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		piece,
    		title,
    		removalDialog,
    		load,
    		remove,
    		processDecision,
    		dialog_binding,
    		div1_binding
    	];
    }

    class HistoryEntry extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { piece: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HistoryEntry",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get piece() {
    		throw new Error("<HistoryEntry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set piece(value) {
    		throw new Error("<HistoryEntry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\SheetActions.svelte generated by Svelte v3.55.1 */
    const file$2 = "src\\components\\SheetActions.svelte";

    // (15:8) {:else}
    function create_else_block_1$1(ctx) {
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
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(15:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:8) {#if settings.capturingImage}
    function create_if_block_2$1(ctx) {
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(13:8) {#if settings.capturingImage}",
    		ctx
    	});

    	return block;
    }

    // (20:4) {#if typeof ClipboardItem !== "undefined"}
    function create_if_block$1(ctx) {
    	let button;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*settings*/ ctx[0].capturingImage) return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if_block.c();
    			button.disabled = button_disabled_value = /*settings*/ ctx[0].capturingImage;
    			add_location(button, file$2, 21, 8, 608);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if_block.m(button, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[4], false, false, false);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(20:4) {#if typeof ClipboardItem !== \\\"undefined\\\"}",
    		ctx
    	});

    	return block;
    }

    // (25:12) {:else}
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
    		source: "(25:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:12) {#if settings.capturingImage}
    function create_if_block_1$1(ctx) {
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(23:12) {#if settings.capturingImage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let button1_disabled_value;
    	let t2;
    	let t3;
    	let button2;
    	let t5;
    	let button3;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*settings*/ ctx[0].capturingImage) return create_if_block_2$1;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = typeof ClipboardItem !== "undefined" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Copy Text";
    			t1 = space();
    			button1 = element("button");
    			if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Copy Transposes";
    			t5 = space();
    			button3 = element("button");
    			button3.textContent = "Export";
    			add_location(button0, file$2, 9, 4, 183);
    			button1.disabled = button1_disabled_value = /*settings*/ ctx[0].capturingImage;
    			add_location(button1, file$2, 11, 4, 255);
    			add_location(button2, file$2, 30, 4, 888);
    			add_location(button3, file$2, 32, 4, 972);
    			attr_dev(div, "class", "flex flex-row gap-1");
    			add_location(div, file$2, 8, 0, 145);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			if_block0.m(button1, null);
    			append_dev(div, t2);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t3);
    			append_dev(div, button2);
    			append_dev(div, t5);
    			append_dev(div, button3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[3], false, false, false),
    					listen_dev(button2, "click", /*click_handler_3*/ ctx[5], false, false, false),
    					listen_dev(button3, "click", /*click_handler_4*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(button1, null);
    				}
    			}

    			if (dirty & /*settings*/ 1 && button1_disabled_value !== (button1_disabled_value = /*settings*/ ctx[0].capturingImage)) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}

    			if (typeof ClipboardItem !== "undefined") if_block1.p(ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots('SheetActions', slots, []);
    	let { settings } = $$props;
    	let dispatch = createEventDispatcher();

    	$$self.$$.on_mount.push(function () {
    		if (settings === undefined && !('settings' in $$props || $$self.$$.bound[$$self.$$.props['settings']])) {
    			console.warn("<SheetActions> was created without expected prop 'settings'");
    		}
    	});

    	const writable_props = ['settings'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SheetActions> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("copyText");
    	const click_handler_1 = () => dispatch("captureSheetAsImage", { mode: "download" });
    	const click_handler_2 = () => dispatch("captureSheetAsImage", { mode: "copy" });
    	const click_handler_3 = () => dispatch("copyTransposes");
    	const click_handler_4 = () => dispatch("export");

    	$$self.$$set = $$props => {
    		if ('settings' in $$props) $$invalidate(0, settings = $$props.settings);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		settings,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('settings' in $$props) $$invalidate(0, settings = $$props.settings);
    		if ('dispatch' in $$props) $$invalidate(1, dispatch = $$props.dispatch);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		settings,
    		dispatch,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class SheetActions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { settings: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetActions",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get settings() {
    		throw new Error("<SheetActions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings(value) {
    		throw new Error("<SheetActions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Guide.svelte generated by Svelte v3.55.1 */
    const file$1 = "src\\components\\Guide.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let t0;
    	let br0;
    	let t1;
    	let hr;
    	let t2;
    	let br1;
    	let t3;
    	let span0;
    	let t4;
    	let br2;
    	let t5;
    	let span1;
    	let t6;
    	let br3;
    	let t7;
    	let span2;
    	let t8;
    	let br4;
    	let t9;
    	let span3;
    	let t10;
    	let br5;
    	let t11;
    	let span4;
    	let t12;
    	let br6;
    	let t13;
    	let span5;
    	let t14;
    	let br7;
    	let t15;
    	let span6;
    	let t16;
    	let br8;
    	let t17;
    	let span7;
    	let t18;
    	let br9;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Click on a note to set selection beginning/ending");
    			br0 = element("br");
    			t1 = text("\n    Double-click on a note to select the whole line\n    ");
    			hr = element("hr");
    			t2 = text("\n    Timing:");
    			br1 = element("br");
    			t3 = space();
    			span0 = element("span");
    			t4 = text("Longer than whole note");
    			br2 = element("br");
    			t5 = space();
    			span1 = element("span");
    			t6 = text("Whole note (s.... f)");
    			br3 = element("br");
    			t7 = space();
    			span2 = element("span");
    			t8 = text("Half note (s, f)");
    			br4 = element("br");
    			t9 = space();
    			span3 = element("span");
    			t10 = text("Quarter note (s - f)");
    			br5 = element("br");
    			t11 = space();
    			span4 = element("span");
    			t12 = text("Eighth note (s f)");
    			br6 = element("br");
    			t13 = space();
    			span5 = element("span");
    			t14 = text("Sixteenth note (s-f)");
    			br7 = element("br");
    			t15 = space();
    			span6 = element("span");
    			t16 = text("Thirty-second note");
    			br8 = element("br");
    			t17 = space();
    			span7 = element("span");
    			t18 = text("Shorter than thirty-second");
    			br9 = element("br");
    			add_location(br0, file$1, 5, 53, 141);
    			attr_dev(hr, "class", "my-2 mx-1");
    			add_location(hr, file$1, 7, 4, 202);
    			add_location(br1, file$1, 8, 11, 236);
    			set_style(span0, "color", colors.quadruple);
    			add_location(span0, file$1, 9, 4, 245);
    			add_location(br2, file$1, 9, 73, 314);
    			set_style(span1, "color", colors.whole);
    			add_location(span1, file$1, 10, 4, 323);
    			add_location(br3, file$1, 10, 67, 386);
    			set_style(span2, "color", colors.half);
    			add_location(span2, file$1, 11, 4, 395);
    			add_location(br4, file$1, 11, 62, 453);
    			set_style(span3, "color", colors.quarter);
    			add_location(span3, file$1, 12, 4, 462);
    			add_location(br5, file$1, 12, 69, 527);
    			set_style(span4, "color", colors.eighth);
    			add_location(span4, file$1, 13, 4, 536);
    			add_location(br6, file$1, 13, 65, 597);
    			set_style(span5, "color", colors.sixteenth);
    			add_location(span5, file$1, 14, 4, 606);
    			add_location(br7, file$1, 14, 71, 673);
    			set_style(span6, "color", colors.thirtysecond);
    			add_location(span6, file$1, 15, 4, 682);
    			add_location(br8, file$1, 15, 72, 750);
    			set_style(span7, "color", colors.sixtyfourth);
    			add_location(span7, file$1, 16, 4, 759);
    			add_location(br9, file$1, 16, 79, 834);
    			attr_dev(div, "id", "guide");
    			add_location(div, file$1, 4, 0, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br0);
    			append_dev(div, t1);
    			append_dev(div, hr);
    			append_dev(div, t2);
    			append_dev(div, br1);
    			append_dev(div, t3);
    			append_dev(div, span0);
    			append_dev(span0, t4);
    			append_dev(div, br2);
    			append_dev(div, t5);
    			append_dev(div, span1);
    			append_dev(span1, t6);
    			append_dev(div, br3);
    			append_dev(div, t7);
    			append_dev(div, span2);
    			append_dev(span2, t8);
    			append_dev(div, br4);
    			append_dev(div, t9);
    			append_dev(div, span3);
    			append_dev(span3, t10);
    			append_dev(div, br5);
    			append_dev(div, t11);
    			append_dev(div, span4);
    			append_dev(span4, t12);
    			append_dev(div, br6);
    			append_dev(div, t13);
    			append_dev(div, span5);
    			append_dev(span5, t14);
    			append_dev(div, br7);
    			append_dev(div, t15);
    			append_dev(div, span6);
    			append_dev(span6, t16);
    			append_dev(div, br8);
    			append_dev(div, t17);
    			append_dev(div, span7);
    			append_dev(span7, t18);
    			append_dev(div, br9);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	validate_slots('Guide', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Guide> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ colors });
    	return [];
    }

    class Guide extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Guide",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var css_248z = "/*\n! tailwindcss v3.4.3 | MIT License | https://tailwindcss.com\n*//*\n1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)\n2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)\n*/\n\n*,\n::before,\n::after {\n  box-sizing: border-box; /* 1 */\n  border-width: 0; /* 2 */\n  border-style: solid; /* 2 */\n  border-color: #e5e7eb; /* 2 */\n}\n\n::before,\n::after {\n  --tw-content: '';\n}\n\n/*\n1. Use a consistent sensible line-height in all browsers.\n2. Prevent adjustments of font size after orientation changes in iOS.\n3. Use a more readable tab size.\n4. Use the user's configured `sans` font-family by default.\n5. Use the user's configured `sans` font-feature-settings by default.\n6. Use the user's configured `sans` font-variation-settings by default.\n7. Disable tap highlights on iOS\n*/\n\nhtml,\n:host {\n  line-height: 1.5; /* 1 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n  -moz-tab-size: 4; /* 3 */\n  -o-tab-size: 4;\n     tab-size: 4; /* 3 */\n  font-family: ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"; /* 4 */\n  font-feature-settings: normal; /* 5 */\n  font-variation-settings: normal; /* 6 */\n  -webkit-tap-highlight-color: transparent; /* 7 */\n}\n\n/*\n1. Remove the margin in all browsers.\n2. Inherit line-height from `html` so users can set them as a class directly on the `html` element.\n*/\n\nbody {\n  margin: 0; /* 1 */\n  line-height: inherit; /* 2 */\n}\n\n/*\n1. Add the correct height in Firefox.\n2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)\n3. Ensure horizontal rules are visible by default.\n*/\n\nhr {\n  height: 0; /* 1 */\n  color: inherit; /* 2 */\n  border-top-width: 1px; /* 3 */\n}\n\n/*\nAdd the correct text decoration in Chrome, Edge, and Safari.\n*/\n\nabbr:where([title]) {\n  -webkit-text-decoration: underline dotted;\n          text-decoration: underline dotted;\n}\n\n/*\nRemove the default font size and weight for headings.\n*/\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\n/*\nReset links to optimize for opt-in styling instead of opt-out.\n*/\n\na {\n  color: inherit;\n  text-decoration: inherit;\n}\n\n/*\nAdd the correct font weight in Edge and Safari.\n*/\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/*\n1. Use the user's configured `mono` font-family by default.\n2. Use the user's configured `mono` font-feature-settings by default.\n3. Use the user's configured `mono` font-variation-settings by default.\n4. Correct the odd `em` font sizing in all browsers.\n*/\n\ncode,\nkbd,\nsamp,\npre {\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace; /* 1 */\n  font-feature-settings: normal; /* 2 */\n  font-variation-settings: normal; /* 3 */\n  font-size: 1em; /* 4 */\n}\n\n/*\nAdd the correct font size in all browsers.\n*/\n\nsmall {\n  font-size: 80%;\n}\n\n/*\nPrevent `sub` and `sup` elements from affecting the line height in all browsers.\n*/\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/*\n1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)\n2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)\n3. Remove gaps between table borders by default.\n*/\n\ntable {\n  text-indent: 0; /* 1 */\n  border-color: inherit; /* 2 */\n  border-collapse: collapse; /* 3 */\n}\n\n/*\n1. Change the font styles in all browsers.\n2. Remove the margin in Firefox and Safari.\n3. Remove default padding in all browsers.\n*/\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit; /* 1 */\n  font-feature-settings: inherit; /* 1 */\n  font-variation-settings: inherit; /* 1 */\n  font-size: 100%; /* 1 */\n  font-weight: inherit; /* 1 */\n  line-height: inherit; /* 1 */\n  letter-spacing: inherit; /* 1 */\n  color: inherit; /* 1 */\n  margin: 0; /* 2 */\n  padding: 0; /* 3 */\n}\n\n/*\nRemove the inheritance of text transform in Edge and Firefox.\n*/\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Remove default button styles.\n*/\n\nbutton,\ninput:where([type='button']),\ninput:where([type='reset']),\ninput:where([type='submit']) {\n  -webkit-appearance: button; /* 1 */\n  background-color: transparent; /* 2 */\n  background-image: none; /* 2 */\n}\n\n/*\nUse the modern Firefox focus style for all focusable elements.\n*/\n\n:-moz-focusring {\n  outline: auto;\n}\n\n/*\nRemove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)\n*/\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\n/*\nAdd the correct vertical alignment in Chrome and Firefox.\n*/\n\nprogress {\n  vertical-align: baseline;\n}\n\n/*\nCorrect the cursor style of increment and decrement buttons in Safari.\n*/\n\n::-webkit-inner-spin-button,\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/*\n1. Correct the odd appearance in Chrome and Safari.\n2. Correct the outline style in Safari.\n*/\n\n[type='search'] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/*\nRemove the inner padding in Chrome and Safari on macOS.\n*/\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Change font properties to `inherit` in Safari.\n*/\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n\n/*\nAdd the correct display in Chrome and Safari.\n*/\n\nsummary {\n  display: list-item;\n}\n\n/*\nRemoves the default spacing and border for appropriate elements.\n*/\n\nblockquote,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nhr,\nfigure,\np,\npre {\n  margin: 0;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nlegend {\n  padding: 0;\n}\n\nol,\nul,\nmenu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n\n/*\nReset default styling for dialogs.\n*/\ndialog {\n  padding: 0;\n}\n\n/*\nPrevent resizing textareas horizontally by default.\n*/\n\ntextarea {\n  resize: vertical;\n}\n\n/*\n1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)\n2. Set the default placeholder color to the user's configured gray 400 color.\n*/\n\ninput::-moz-placeholder, textarea::-moz-placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\ninput::placeholder,\ntextarea::placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\n/*\nSet the default cursor for buttons.\n*/\n\nbutton,\n[role=\"button\"] {\n  cursor: pointer;\n}\n\n/*\nMake sure disabled buttons don't get the pointer cursor.\n*/\n:disabled {\n  cursor: default;\n}\n\n/*\n1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)\n2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)\n   This can trigger a poorly considered lint error in some tools but is included by design.\n*/\n\nimg,\nsvg,\nvideo,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block; /* 1 */\n  vertical-align: middle; /* 2 */\n}\n\n/*\nConstrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)\n*/\n\nimg,\nvideo {\n  max-width: 100%;\n  height: auto;\n}\n\n/* Make elements with the HTML hidden attribute stay hidden by default */\n[hidden] {\n  display: none;\n}\n\n*, ::before, ::after {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position:  ;\n  --tw-gradient-via-position:  ;\n  --tw-gradient-to-position:  ;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n  --tw-contain-size:  ;\n  --tw-contain-layout:  ;\n  --tw-contain-paint:  ;\n  --tw-contain-style:  ;\n}\n\n::backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position:  ;\n  --tw-gradient-via-position:  ;\n  --tw-gradient-to-position:  ;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n  --tw-contain-size:  ;\n  --tw-contain-layout:  ;\n  --tw-contain-paint:  ;\n  --tw-contain-style:  ;\n}.container {\n  width: 100%;\n}@media (min-width: 640px) {\n\n  .container {\n    max-width: 640px;\n  }\n}@media (min-width: 768px) {\n\n  .container {\n    max-width: 768px;\n  }\n}@media (min-width: 1024px) {\n\n  .container {\n    max-width: 1024px;\n  }\n}@media (min-width: 1280px) {\n\n  .container {\n    max-width: 1280px;\n  }\n}@media (min-width: 1536px) {\n\n  .container {\n    max-width: 1536px;\n  }\n}.absolute {\n  position: absolute;\n}.relative {\n  position: relative;\n}.sticky {\n  position: sticky;\n}.top-0 {\n  top: 0px;\n}.z-40 {\n  z-index: 40;\n}.z-50 {\n  z-index: 50;\n}.row-auto {\n  grid-row: auto;\n}.m-1 {\n  margin: 0.25rem;\n}.mx-1 {\n  margin-left: 0.25rem;\n  margin-right: 0.25rem;\n}.mx-2 {\n  margin-left: 0.5rem;\n  margin-right: 0.5rem;\n}.my-2 {\n  margin-top: 0.5rem;\n  margin-bottom: 0.5rem;\n}.mb-2 {\n  margin-bottom: 0.5rem;\n}.mt-3 {\n  margin-top: 0.75rem;\n}.box-border {\n  box-sizing: border-box;\n}.block {\n  display: block;\n}.inline-block {\n  display: inline-block;\n}.flex {\n  display: flex;\n}.inline-flex {\n  display: inline-flex;\n}.hidden {\n  display: none;\n}.h-full {\n  height: 100%;\n}.w-16 {\n  width: 4rem;\n}.w-3\\/4 {\n  width: 75%;\n}.w-32 {\n  width: 8rem;\n}.w-\\[58em\\] {\n  width: 58em;\n}.w-full {\n  width: 100%;\n}.max-w-64 {\n  max-width: 16rem;\n}.transform {\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}.cursor-pointer {\n  cursor: pointer;\n}.flex-row {\n  flex-direction: row;\n}.flex-col {\n  flex-direction: column;\n}.flex-wrap {\n  flex-wrap: wrap;\n}.content-center {\n  align-content: center;\n}.items-start {\n  align-items: flex-start;\n}.items-center {\n  align-items: center;\n}.items-stretch {\n  align-items: stretch;\n}.justify-center {\n  justify-content: center;\n}.justify-around {\n  justify-content: space-around;\n}.gap-1 {\n  gap: 0.25rem;\n}.gap-12 {\n  gap: 3rem;\n}.gap-2 {\n  gap: 0.5rem;\n}.gap-4 {\n  gap: 1rem;\n}.gap-6 {\n  gap: 1.5rem;\n}.overflow-hidden {\n  overflow: hidden;\n}.overflow-clip {\n  overflow: clip;\n}.overflow-y-auto {\n  overflow-y: auto;\n}.text-ellipsis {\n  text-overflow: ellipsis;\n}.text-nowrap {\n  text-wrap: nowrap;\n}.rounded-lg {\n  border-radius: 0.5rem;\n}.rounded-xl {\n  border-radius: 0.75rem;\n}.border {\n  border-width: 1px;\n}.p-1 {\n  padding: 0.25rem;\n}.p-3 {\n  padding: 0.75rem;\n}.p-4 {\n  padding: 1rem;\n}.text-center {\n  text-align: center;\n}.align-middle {\n  vertical-align: middle;\n}.text-2xl {\n  font-size: 1.5rem;\n  line-height: 2rem;\n}.text-3xl {\n  font-size: 1.875rem;\n  line-height: 2.25rem;\n}.text-xl {\n  font-size: 1.25rem;\n  line-height: 1.75rem;\n}.lowercase {\n  text-transform: lowercase;\n}.italic {\n  font-style: italic;\n}.text-white {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity));\n}.underline {\n  text-decoration-line: underline;\n}.filter {\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}.transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}";
    styleInject(css_248z);

    /* src\App.svelte generated by Svelte v3.55.1 */

    const { console: console_1, document: document_1, window: window_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[84] = list[i];
    	child_ctx[86] = i;
    	return child_ctx;
    }

    function get_if_ctx(ctx) {
    	const child_ctx = ctx.slice();
    	const constants_0 = /*chords_and_otherwise*/ child_ctx[11][+/*index*/ child_ctx[86] + 1];
    	child_ctx[87] = constants_0;
    	const constants_1 = /*chords_and_otherwise*/ child_ctx[11][+/*index*/ child_ctx[86] - 1];
    	child_ctx[88] = constants_1;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[89] = list[i];
    	child_ctx[90] = list;
    	child_ctx[91] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[92] = list[i];
    	return child_ctx;
    }

    // (693:4) {#if pieces.length > 0}
    function create_if_block_10(ctx) {
    	let hr;
    	let t0;
    	let div1;
    	let show_if;
    	let t1;
    	let div0;
    	let t2;
    	let div2;
    	let t3;
    	let t4;
    	let t5;
    	let span;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (dirty[0] & /*pieces*/ 32768) show_if = null;
    		if (show_if == null) show_if = !!(/*pieces*/ ctx[15].length == 1 && /*pieces*/ ctx[15][0].name.endsWith("(sample)"));
    		if (show_if) return create_if_block_11;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx, [-1, -1, -1, -1]);
    	let if_block = current_block_type(ctx);
    	let each_value_2 = /*pieces*/ ctx[15];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			t0 = space();
    			div1 = element("div");
    			if_block.c();
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div2 = element("div");
    			t3 = text("Used ~");
    			t4 = text(/*remaining*/ ctx[6]);
    			t5 = text(" / 5000 kB\n            ");
    			span = element("span");
    			span.textContent = "ⓘ";
    			attr_dev(hr, "class", "w-[58em]");
    			set_style(hr, "border", "1px solid #a0a0a0");
    			add_location(hr, file, 693, 8, 24081);
    			attr_dev(div0, "class", "w-3/4 flex flex-wrap justify-center gap-2 overflow-clip text-ellipsis");
    			add_location(div0, file, 701, 12, 24484);
    			attr_dev(div1, "class", "flex flex-col items-center gap-6");
    			add_location(div1, file, 695, 8, 24146);
    			attr_dev(span, "title", "The last entry (or multiple) will automatically be dropped if an autosave fails.\nYou can also right-click a saved sheet to manually delete it.\nIndividual sizes are an estimation, the total is correct.");
    			add_location(span, file, 714, 12, 25088);
    			add_location(div2, file, 713, 8, 25043);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t3);
    			append_dev(div2, t4);
    			append_dev(div2, t5);
    			append_dev(div2, span);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx, dirty))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			}

    			if (dirty[0] & /*pieces, existingProject, importer, remaining, downloadSheetData*/ 268468321) {
    				each_value_2 = /*pieces*/ ctx[15];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*remaining*/ 64) set_data_dev(t4, /*remaining*/ ctx[6]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
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
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(693:4) {#if pieces.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (699:12) {:else}
    function create_else_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Or, continue one of your previous projects:";
    			attr_dev(p, "class", "text-white text-3xl");
    			add_location(p, file, 699, 12, 24375);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(699:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (697:12) {#if pieces.length == 1 && pieces[0].name.endsWith("(sample)")}
    function create_if_block_11(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Or, try this sample piece:";
    			attr_dev(p, "class", "text-white text-3xl");
    			add_location(p, file, 697, 12, 24281);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(697:12) {#if pieces.length == 1 && pieces[0].name.endsWith(\\\"(sample)\\\")}",
    		ctx
    	});

    	return block;
    }

    // (703:16) {#each pieces as piece}
    function create_each_block_2(ctx) {
    	let historyentry;
    	let current;

    	function export_handler() {
    		return /*export_handler*/ ctx[51](/*piece*/ ctx[92]);
    	}

    	historyentry = new HistoryEntry({
    			props: { piece: /*piece*/ ctx[92] },
    			$$inline: true
    		});

    	historyentry.$on("load", /*load_handler*/ ctx[49]);
    	historyentry.$on("refresh", /*refresh_handler*/ ctx[50]);
    	historyentry.$on("export", export_handler);

    	const block = {
    		c: function create() {
    			create_component(historyentry.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(historyentry, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const historyentry_changes = {};
    			if (dirty[0] & /*pieces*/ 32768) historyentry_changes.piece = /*piece*/ ctx[92];
    			historyentry.$set(historyentry_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(historyentry.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(historyentry.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(historyentry, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(703:16) {#each pieces as piece}",
    		ctx
    	});

    	return block;
    }

    // (726:12) {#if sheetReady}
    function create_if_block_9(ctx) {
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let button;
    	let t4;
    	let hr;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("You are currently editing: ");
    			t1 = text(/*filename*/ ctx[7]);
    			t2 = space();
    			button = element("button");
    			button.textContent = "Import another MIDI/JSON file";
    			t4 = space();
    			hr = element("hr");
    			attr_dev(p, "class", "mb-2");
    			add_location(p, file, 726, 16, 25685);
    			attr_dev(button, "class", "w-full");
    			add_location(button, file, 727, 16, 25759);
    			attr_dev(hr, "class", "my-2 mx-1");
    			add_location(hr, file, 730, 16, 25990);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, hr, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[53], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filename*/ 128) set_data_dev(t1, /*filename*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(hr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(726:12) {#if sheetReady}",
    		ctx
    	});

    	return block;
    }

    // (737:16) {#if has_selection}
    function create_if_block_8(ctx) {
    	let div0;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let button3;
    	let t7;
    	let div1;
    	let button4;
    	let t9;
    	let button5;
    	let t11;
    	let button6;
    	let t13;
    	let div2;
    	let button7;
    	let t15;
    	let button8;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Transpose selection down";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Transpose selection up";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Auto-transpose (single)";
    			t5 = space();
    			button3 = element("button");
    			button3.textContent = "Auto-transpose (multi)";
    			t7 = space();
    			div1 = element("div");
    			button4 = element("button");
    			button4.textContent = "Split selection";
    			t9 = space();
    			button5 = element("button");
    			button5.textContent = "Join selection";
    			t11 = space();
    			button6 = element("button");
    			button6.textContent = "Add a comment";
    			t13 = space();
    			div2 = element("div");
    			button7 = element("button");
    			button7.textContent = "Continue transposition (right to left)";
    			t15 = space();
    			button8 = element("button");
    			button8.textContent = "Continue transposition (left to right)";
    			attr_dev(button0, "class", "w-full block");
    			add_location(button0, file, 738, 20, 26316);
    			attr_dev(button1, "class", "w-full block");
    			add_location(button1, file, 739, 20, 26523);
    			attr_dev(div0, "class", "flex flex-row justify-around items-center gap-2");
    			add_location(div0, file, 737, 16, 26234);
    			add_location(button2, file, 741, 16, 26748);
    			add_location(button3, file, 742, 16, 26870);
    			attr_dev(button4, "class", "w-full block");
    			add_location(button4, file, 744, 20, 27084);
    			attr_dev(button5, "class", "w-full block");
    			add_location(button5, file, 745, 20, 27207);
    			attr_dev(div1, "class", "flex flex-row justify-around items-stretch gap-2");
    			add_location(div1, file, 743, 16, 27001);
    			add_location(button6, file, 747, 16, 27364);
    			attr_dev(button7, "class", "w-full block");
    			add_location(button7, file, 750, 20, 27590);
    			attr_dev(button8, "class", "w-full block");
    			add_location(button8, file, 751, 20, 27733);
    			attr_dev(div2, "class", "flex flex-row justify-around items-stretch gap-2");
    			add_location(div2, file, 749, 16, 27507);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button0);
    			append_dev(div0, t1);
    			append_dev(div0, button1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, button3, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button4);
    			append_dev(div1, t9);
    			append_dev(div1, button5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, button6, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, button7);
    			append_dev(div2, t15);
    			append_dev(div2, button8);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_2*/ ctx[54], false, false, false),
    					listen_dev(button1, "click", /*click_handler_3*/ ctx[55], false, false, false),
    					listen_dev(button2, "click", /*click_handler_4*/ ctx[56], false, false, false),
    					listen_dev(button3, "click", /*click_handler_5*/ ctx[57], false, false, false),
    					listen_dev(button4, "click", /*click_handler_6*/ ctx[58], false, false, false),
    					listen_dev(button5, "click", /*click_handler_7*/ ctx[59], false, false, false),
    					listen_dev(button6, "click", /*click_handler_8*/ ctx[60], false, false, false),
    					listen_dev(button7, "click", /*click_handler_9*/ ctx[61], false, false, false),
    					listen_dev(button8, "click", /*click_handler_10*/ ctx[62], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(button3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(button6);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(737:16) {#if has_selection}",
    		ctx
    	});

    	return block;
    }

    // (770:8) {#if tracks}
    function create_if_block_7(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*tracks*/ ctx[10];
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
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tracks, selectedTracks*/ 5120) {
    				each_value_1 = /*tracks*/ ctx[10];
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
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(770:8) {#if tracks}",
    		ctx
    	});

    	return block;
    }

    // (771:12) {#each tracks as track, idx}
    function create_each_block_1(ctx) {
    	let track;
    	let updating_selected;
    	let current;

    	function track_selected_binding(value) {
    		/*track_selected_binding*/ ctx[64](value, /*idx*/ ctx[91]);
    	}

    	let track_props = {
    		track: /*track*/ ctx[89],
    		idx: /*idx*/ ctx[91] + 1
    	};

    	if (/*selectedTracks*/ ctx[12][/*idx*/ ctx[91]] !== void 0) {
    		track_props.selected = /*selectedTracks*/ ctx[12][/*idx*/ ctx[91]];
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
    			if (dirty[0] & /*tracks*/ 1024) track_changes.track = /*track*/ ctx[89];

    			if (!updating_selected && dirty[0] & /*selectedTracks*/ 4096) {
    				updating_selected = true;
    				track_changes.selected = /*selectedTracks*/ ctx[12][/*idx*/ ctx[91]];
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
    		source: "(771:12) {#each tracks as track, idx}",
    		ctx
    	});

    	return block;
    }

    // (780:4) {#if sheetReady == true}
    function create_if_block(ctx) {
    	let div2;
    	let sheetactions;
    	let t;
    	let div1;
    	let div0;
    	let div0_resize_listener;
    	let current;
    	let mounted;
    	let dispose;

    	sheetactions = new SheetActions({
    			props: { settings: /*settings*/ ctx[3] },
    			$$inline: true
    		});

    	sheetactions.$on("captureSheetAsImage", /*captureSheetAsImage_handler*/ ctx[67]);
    	sheetactions.$on("copyText", /*copyText_handler*/ ctx[68]);
    	sheetactions.$on("copyTransposes", /*copyTransposes_handler*/ ctx[69]);
    	sheetactions.$on("export", /*export_handler_1*/ ctx[70]);
    	let each_value = /*chords_and_otherwise*/ ctx[11];
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
    			div2 = element("div");
    			create_component(sheetactions.$$.fragment);
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(div0, "width", "max-content");
    			set_style(div0, "font-family", /*settings*/ ctx[3].font);
    			set_style(div0, "line-height", /*settings*/ ctx[3].lineHeight + "%");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[72].call(div0));
    			add_location(div0, file, 807, 16, 30296);
    			set_style(div1, "background", "#2D2A32");
    			set_style(div1, "user-select", "none");
    			add_location(div1, file, 806, 12, 30205);
    			attr_dev(div2, "class", "flex flex-col items-start");
    			add_location(div2, file, 780, 8, 28948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			mount_component(sheetactions, div2, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[72].bind(div0));
    			/*div1_binding*/ ctx[73](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", self(/*resetSelection*/ ctx[32]), false, false, false),
    					listen_dev(div0, "keypress", self(keypress_handler_2), false, false, false),
    					listen_dev(div2, "click", self(/*resetSelection*/ ctx[32]), false, false, false),
    					listen_dev(div2, "keypress", self(keypress_handler_3), false, false, false),
    					listen_dev(div2, "contextmenu", prevent_default(/*contextmenu_handler*/ ctx[39]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const sheetactions_changes = {};
    			if (dirty[0] & /*settings*/ 8) sheetactions_changes.settings = /*settings*/ ctx[3];
    			sheetactions.$set(sheetactions_changes);

    			if (dirty[0] & /*chords_and_otherwise, updateComment, settings*/ 2099208 | dirty[1] & /*setSelection*/ 8) {
    				each_value = /*chords_and_otherwise*/ ctx[11];
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

    			if (!current || dirty[0] & /*settings*/ 8) {
    				set_style(div0, "font-family", /*settings*/ ctx[3].font);
    			}

    			if (!current || dirty[0] & /*settings*/ 8) {
    				set_style(div0, "line-height", /*settings*/ ctx[3].lineHeight + "%");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sheetactions.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sheetactions.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(sheetactions);
    			destroy_each(each_blocks, detaching);
    			div0_resize_listener();
    			/*div1_binding*/ ctx[73](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(780:4) {#if sheetReady == true}",
    		ctx
    	});

    	return block;
    }

    // (836:24) {:else}
    function create_else_block_1(ctx) {
    	let chord;
    	let current;

    	chord = new Chord({
    			props: {
    				chord: /*inner*/ ctx[84],
    				next: /*inner*/ ctx[84].next ?? undefined,
    				selected: /*inner*/ ctx[84].selected,
    				index: /*inner*/ ctx[84].index,
    				settings: /*settings*/ ctx[3]
    			},
    			$$inline: true
    		});

    	chord.$on("select", /*setSelection*/ ctx[34]);

    	const block = {
    		c: function create() {
    			create_component(chord.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chord, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chord_changes = {};
    			if (dirty[0] & /*chords_and_otherwise*/ 2048) chord_changes.chord = /*inner*/ ctx[84];
    			if (dirty[0] & /*chords_and_otherwise*/ 2048) chord_changes.next = /*inner*/ ctx[84].next ?? undefined;
    			if (dirty[0] & /*chords_and_otherwise*/ 2048) chord_changes.selected = /*inner*/ ctx[84].selected;
    			if (dirty[0] & /*chords_and_otherwise*/ 2048) chord_changes.index = /*inner*/ ctx[84].index;
    			if (dirty[0] & /*settings*/ 8) chord_changes.settings = /*settings*/ ctx[3];
    			chord.$set(chord_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chord.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chord.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chord, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(836:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (811:24) {#if inner.type}
    function create_if_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*inner*/ ctx[84].type === "break") return create_if_block_2;
    		if (/*inner*/ ctx[84].type === "comment") return create_if_block_4;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(811:24) {#if inner.type}",
    		ctx
    	});

    	return block;
    }

    // (818:63) 
    function create_if_block_4(ctx) {
    	let t0;
    	let t1;
    	let br;
    	let if_block0 = /*previous_thing*/ ctx[88]?.type != "comment" && /*inner*/ ctx[84].notop != true && create_if_block_6(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (/*inner*/ ctx[84].kind == "custom" || /*inner*/ ctx[84].kind == "tempo") return create_if_block_5;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if_block1.c();
    			t1 = space();
    			br = element("br");
    			add_location(br, file, 833, 32, 32110);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*previous_thing*/ ctx[88]?.type != "comment" && /*inner*/ ctx[84].notop != true) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(818:63) ",
    		ctx
    	});

    	return block;
    }

    // (814:28) {#if inner.type === "break"}
    function create_if_block_2(ctx) {
    	let if_block_anchor;
    	let if_block = /*next_thing*/ ctx[87]?.type != "comment" && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*next_thing*/ ctx[87]?.type != "comment") {
    				if (if_block) ; else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(814:28) {#if inner.type === \\\"break\\\"}",
    		ctx
    	});

    	return block;
    }

    // (819:32) {#if previous_thing?.type != "comment" && inner.notop != true}
    function create_if_block_6(ctx) {
    	let br;

    	const block = {
    		c: function create() {
    			br = element("br");
    			add_location(br, file, 819, 36, 31210);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(819:32) {#if previous_thing?.type != \\\"comment\\\" && inner.notop != true}",
    		ctx
    	});

    	return block;
    }

    // (831:32) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t_value = /*inner*/ ctx[84].text + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "comment");
    			add_location(span, file, 831, 36, 31968);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "contextmenu", prevent_default(/*contextmenu_handler_2*/ ctx[43]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*chords_and_otherwise*/ 2048 && t_value !== (t_value = /*inner*/ ctx[84].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(831:32) {:else}",
    		ctx
    	});

    	return block;
    }

    // (822:32) {#if inner.kind == "custom" || inner.kind == "tempo"}
    function create_if_block_5(ctx) {
    	let span;
    	let t_value = /*inner*/ ctx[84].text + "";
    	let t;
    	let mounted;
    	let dispose;

    	function focusout_handler(...args) {
    		return /*focusout_handler*/ ctx[71](/*index*/ ctx[86], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "comment");
    			attr_dev(span, "contenteditable", "true");
    			set_style(span, "white-space", "pre-wrap");
    			add_location(span, file, 822, 36, 31375);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", stop_propagation(/*click_handler*/ ctx[40]), false, false, true),
    					listen_dev(span, "keypress", stop_propagation(/*keypress_handler*/ ctx[41]), false, false, true),
    					listen_dev(span, "contextmenu", prevent_default(/*contextmenu_handler_1*/ ctx[42]), false, true, false),
    					listen_dev(span, "focusout", focusout_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*chords_and_otherwise*/ 2048 && t_value !== (t_value = /*inner*/ ctx[84].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(822:32) {#if inner.kind == \\\"custom\\\" || inner.kind == \\\"tempo\\\"}",
    		ctx
    	});

    	return block;
    }

    // (815:32) {#if next_thing?.type != "comment"}
    function create_if_block_3(ctx) {
    	let br;

    	const block = {
    		c: function create() {
    			br = element("br");
    			add_location(br, file, 815, 36, 30972);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(815:32) {#if next_thing?.type != \\\"comment\\\"}",
    		ctx
    	});

    	return block;
    }

    // (809:20) {#each chords_and_otherwise as inner, index }
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*inner*/ ctx[84].type) return 0;
    		return 1;
    	}

    	function select_block_ctx(ctx, index) {
    		if (index === 0) return get_if_ctx(ctx);
    		return ctx;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](select_block_ctx(ctx, current_block_type_index));

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(select_block_ctx(ctx, current_block_type_index), dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](select_block_ctx(ctx, current_block_type_index));
    					if_block.c();
    				} else {
    					if_block.p(select_block_ctx(ctx, current_block_type_index), dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(809:20) {#each chords_and_otherwise as inner, index }",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t0;
    	let t1;
    	let dialog;
    	let form;
    	let p0;
    	let t2;
    	let br;
    	let t3;
    	let t4;
    	let div0;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let button2;
    	let t10;
    	let div2;
    	let div1;
    	let p1;
    	let t12;
    	let label;
    	let t14;
    	let input;
    	let t15;
    	let t16;
    	let div7;
    	let div5;
    	let div4;
    	let t17;
    	let div3;
    	let button3;
    	let t19;
    	let t20;
    	let sheetoptions;
    	let updating_settings;
    	let t21;
    	let guide;
    	let t22;
    	let section;
    	let div6;
    	let t23;
    	let button4;
    	let t25;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*pieces*/ ctx[15].length > 0 && create_if_block_10(ctx);
    	let if_block1 = /*sheetReady*/ ctx[9] && create_if_block_9(ctx);
    	let if_block2 = /*has_selection*/ ctx[16] && create_if_block_8(ctx);

    	function sheetoptions_settings_binding(value) {
    		/*sheetoptions_settings_binding*/ ctx[63](value);
    	}

    	let sheetoptions_props = {
    		show: /*sheetReady*/ ctx[9],
    		hasMIDI: !!/*MIDIObject*/ ctx[2]
    	};

    	if (/*settings*/ ctx[3] !== void 0) {
    		sheetoptions_props.settings = /*settings*/ ctx[3];
    	}

    	sheetoptions = new SheetOptions({
    			props: sheetoptions_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(sheetoptions, 'settings', sheetoptions_settings_binding));
    	guide = new Guide({ $$inline: true });
    	let if_block3 = /*tracks*/ ctx[10] && create_if_block_7(ctx);
    	let if_block4 = /*sheetReady*/ ctx[9] == true && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    			dialog = element("dialog");
    			form = element("form");
    			p0 = element("p");
    			t2 = text("Careful, you've previously edited this sheet!\n            ");
    			br = element("br");
    			t3 = text("\n            Loading it again will overwrite your progress.");
    			t4 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Load saved";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Export and Start over";
    			t8 = space();
    			button2 = element("button");
    			button2.textContent = "Start over";
    			t10 = space();
    			div2 = element("div");
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "Import a MIDI/JSON file to get started:";
    			t12 = space();
    			label = element("label");
    			label.textContent = "Click or drop a MIDI/JSON file here!";
    			t14 = space();
    			input = element("input");
    			t15 = space();
    			if (if_block0) if_block0.c();
    			t16 = space();
    			div7 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			if (if_block1) if_block1.c();
    			t17 = space();
    			div3 = element("div");
    			button3 = element("button");
    			button3.textContent = "Select all";
    			t19 = space();
    			if (if_block2) if_block2.c();
    			t20 = space();
    			create_component(sheetoptions.$$.fragment);
    			t21 = space();
    			create_component(guide.$$.fragment);
    			t22 = space();
    			section = element("section");
    			div6 = element("div");
    			if (if_block3) if_block3.c();
    			t23 = space();
    			button4 = element("button");
    			button4.textContent = "Import selected tracks";
    			t25 = space();
    			if (if_block4) if_block4.c();
    			document_1.title = "MIDI Converter";
    			add_location(br, file, 662, 12, 22518);
    			attr_dev(p0, "class", "p-3 text-center");
    			add_location(p0, file, 660, 8, 22420);
    			attr_dev(button0, "formmethod", "dialog");
    			attr_dev(button0, "class", "p-1");
    			button0.value = "load";
    			add_location(button0, file, 666, 12, 22672);
    			attr_dev(button1, "formmethod", "dialog");
    			attr_dev(button1, "class", "p-1");
    			button1.value = "export-and-restart";
    			add_location(button1, file, 667, 12, 22757);
    			attr_dev(button2, "formmethod", "dialog");
    			attr_dev(button2, "class", "p-1");
    			button2.value = "new";
    			add_location(button2, file, 668, 12, 22867);
    			attr_dev(div0, "class", "mx-2 mb-2 flex gap-2 w-full justify-center");
    			add_location(div0, file, 665, 8, 22603);
    			attr_dev(form, "class", "flex flex-col row-auto items-center");
    			add_location(form, file, 659, 4, 22361);
    			attr_dev(dialog, "class", "rounded-lg overflow-hidden");
    			add_location(dialog, file, 657, 0, 22222);
    			attr_dev(p1, "class", "text-white text-3xl");
    			add_location(p1, file, 680, 8, 23419);
    			attr_dev(label, "for", "drop");
    			attr_dev(label, "class", "cursor-pointer rounded-xl text-xl p-4");
    			set_style(label, "border", "2px solid dimgrey");
    			add_location(label, file, 681, 8, 23502);
    			attr_dev(input, "id", "drop");
    			attr_dev(input, "class", "hidden");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", ".mid,.midi,.json");
    			add_location(input, file, 689, 8, 23881);
    			attr_dev(div1, "class", "flex flex-col items-center gap-6");
    			add_location(div1, file, 679, 4, 23364);
    			attr_dev(div2, "class", "flex flex-col gap-12 w-full h-full items-center align-center justify-center content-center absolute top-0 z-50");
    			set_style(div2, "height", "100%");
    			set_style(div2, "background", "rgb(45,42,50)");
    			set_style(div2, "background", "linear-gradient(45deg, rgba(45,42,50,1) 0%, rgba(50,40,40,1) 50%, rgba(71,57,37,1) 100%)");
    			set_style(div2, "transition", "all 0.6s ease-in-out");
    			add_location(div2, file, 673, 0, 22977);
    			add_location(button3, file, 735, 16, 26133);
    			attr_dev(div3, "class", "flex flex-col gap-2");
    			add_location(div3, file, 734, 12, 26083);
    			add_location(div4, file, 724, 8, 25634);
    			attr_dev(div5, "id", "sidebar");
    			attr_dev(div5, "class", "m-1 flex flex-col sticky overflow-y-auto top-0");
    			set_style(div5, "min-width", "25em");
    			set_style(div5, "max-width", "25em");
    			set_style(div5, "max-height", "99vh");
    			add_location(div5, file, 723, 4, 25495);
    			attr_dev(div6, "id", "tracks");
    			attr_dev(div6, "class", "flex flex-col gap-2");
    			add_location(div6, file, 768, 8, 28538);
    			add_location(button4, file, 776, 8, 28801);
    			attr_dev(section, "id", "track-chooser");
    			attr_dev(section, "class", "z-40 w-full absolute flex flex-col gap-4 justify-center items-center content-center text-2xl");
    			set_style(section, "top", "-110vh");
    			set_style(section, "height", "100vh");
    			set_style(section, "background", "rgb(45,42,50)");
    			set_style(section, "background", "linear-gradient(45deg, rgba(45,42,50,1) 0%, rgba(50,40,40,1) 50%, rgba(71,57,37,1) 100%)");
    			set_style(section, "transition", "all 0.6s ease-in-out");
    			add_location(section, file, 764, 4, 28115);
    			attr_dev(div7, "class", "flex flex-row");
    			add_location(div7, file, 722, 0, 25404);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, dialog, anchor);
    			append_dev(dialog, form);
    			append_dev(form, p0);
    			append_dev(p0, t2);
    			append_dev(p0, br);
    			append_dev(p0, t3);
    			append_dev(form, t4);
    			append_dev(form, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t6);
    			append_dev(div0, button1);
    			append_dev(div0, t8);
    			append_dev(div0, button2);
    			/*dialog_binding*/ ctx[46](dialog);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			append_dev(div1, t12);
    			append_dev(div1, label);
    			append_dev(div1, t14);
    			append_dev(div1, input);
    			/*input_binding*/ ctx[48](input);
    			append_dev(div2, t15);
    			if (if_block0) if_block0.m(div2, null);
    			/*div2_binding*/ ctx[52](div2);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div5);
    			append_dev(div5, div4);
    			if (if_block1) if_block1.m(div4, null);
    			append_dev(div4, t17);
    			append_dev(div4, div3);
    			append_dev(div3, button3);
    			append_dev(div3, t19);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(div4, t20);
    			mount_component(sheetoptions, div4, null);
    			append_dev(div5, t21);
    			mount_component(guide, div5, null);
    			append_dev(div7, t22);
    			append_dev(div7, section);
    			append_dev(section, div6);
    			if (if_block3) if_block3.m(div6, null);
    			append_dev(section, t23);
    			append_dev(section, button4);
    			/*section_binding*/ ctx[66](section);
    			append_dev(div7, t25);
    			if (if_block4) if_block4.m(div7, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "keydown", /*keydown_handler*/ ctx[45], false, false, false),
    					listen_dev(document_1.body, "click", self(/*resetSelection*/ ctx[32]), false, false, false),
    					listen_dev(document_1.body, "keypress", self(keypress_handler_1), false, false, false),
    					listen_dev(dialog, "close", /*close_handler*/ ctx[47], false, false, false),
    					listen_dev(label, "drop", prevent_default(/*droppedFile*/ ctx[29]), false, true, false),
    					listen_dev(label, "dragover", prevent_default(/*dragover_handler*/ ctx[44]), false, true, false),
    					listen_dev(input, "change", /*onFileChange*/ ctx[18], false, false, false),
    					listen_dev(button3, "click", /*selectAll*/ ctx[33], false, false, false),
    					listen_dev(button4, "click", /*click_handler_11*/ ctx[65], false, false, false),
    					listen_dev(div7, "click", self(/*resetSelection*/ ctx[32]), false, false, false),
    					listen_dev(div7, "keypress", self(keypress_handler_4), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*pieces*/ ctx[15].length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*pieces*/ 32768) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_10(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*sheetReady*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_9(ctx);
    					if_block1.c();
    					if_block1.m(div4, t17);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*has_selection*/ ctx[16]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_8(ctx);
    					if_block2.c();
    					if_block2.m(div3, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			const sheetoptions_changes = {};
    			if (dirty[0] & /*sheetReady*/ 512) sheetoptions_changes.show = /*sheetReady*/ ctx[9];
    			if (dirty[0] & /*MIDIObject*/ 4) sheetoptions_changes.hasMIDI = !!/*MIDIObject*/ ctx[2];

    			if (!updating_settings && dirty[0] & /*settings*/ 8) {
    				updating_settings = true;
    				sheetoptions_changes.settings = /*settings*/ ctx[3];
    				add_flush_callback(() => updating_settings = false);
    			}

    			sheetoptions.$set(sheetoptions_changes);

    			if (/*tracks*/ ctx[10]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*tracks*/ 1024) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_7(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div6, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*sheetReady*/ ctx[9] == true) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*sheetReady*/ 512) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div7, null);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(sheetoptions.$$.fragment, local);
    			transition_in(guide.$$.fragment, local);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(sheetoptions.$$.fragment, local);
    			transition_out(guide.$$.fragment, local);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(dialog);
    			/*dialog_binding*/ ctx[46](null);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div2);
    			/*input_binding*/ ctx[48](null);
    			if (if_block0) if_block0.d();
    			/*div2_binding*/ ctx[52](null);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(div7);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			destroy_component(sheetoptions);
    			destroy_component(guide);
    			if (if_block3) if_block3.d();
    			/*section_binding*/ ctx[66](null);
    			if (if_block4) if_block4.d();
    			mounted = false;
    			run_all(dispose);
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

    function next_not(coll, pred, start = 0) {
    	let i = start;

    	while (coll[i] && pred(coll[i])) {
    		i++;
    	} /* then */

    	return coll[i];
    }

    const keypress_handler_1 = () => {
    	
    };

    const keypress_handler_2 = () => {
    	
    };

    const keypress_handler_3 = () => {
    	
    };

    const keypress_handler_4 = () => {
    	
    };

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let real_index_of = x => index_of_index(chords_and_otherwise, x);
    	let chord_at = x => chords_and_otherwise[real_index_of(x)];

    	let importer = {
    		element: undefined, // main welcome screen div
    		hide: () => {
    			$$invalidate(5, importer.element.style.top = "-110vh", importer);
    			softRegen();
    			resetSelection();
    			repopulateTransposeComments();
    		},
    		show: () => {
    			$$invalidate(5, importer.element.style.top = "0px", importer);
    		}
    	};

    	let remaining = remainingSize();
    	const sample_uri = 'https://gist.githubusercontent.com/ArijanJ/' + '80f86cbe9dcf8384dbdf9578c83102a6/raw/4ec84c63f655866e6d0d4e1c75949a22537c417e/' + 'Mar' + 'iage_d' + 'Amour_(sample).json';

    	let existingProject = {
    		element: undefined,
    		name: undefined,
    		data: undefined,
    		set: (project, exportedCurrent = false) => {
    			$$invalidate(2, MIDIObject = exportedCurrent ? MIDIObject : undefined);
    			$$invalidate(0, existingProject.name = filename ?? project.name, existingProject);
    			$$invalidate(0, existingProject.data = decompress(project.data), existingProject);
    		},
    		setAndProceed: (project, exportedCurrent = false) => {
    			$$invalidate(2, MIDIObject = exportedCurrent ? MIDIObject : undefined);
    			$$invalidate(0, existingProject.name = filename ?? project.name, existingProject);
    			$$invalidate(0, existingProject.data = decompress(project.data), existingProject);
    			existingProject.proceed('load');
    		},
    		proceed: (force_decision = 'prompt') => {
    			let decision = existingProject.element?.returnValue; // dialog result
    			if (force_decision !== 'prompt') decision = force_decision;
    			if (!decision) return;

    			if (decision == "load" || decision == "existing") {
    				console.log("Loading", existingProject.name);
    				$$invalidate(9, sheetReady = true);
    				$$invalidate(11, chords_and_otherwise = existingProject.data);
    				let old_style_project = !chords_and_otherwise.find(e => is_chord(e))?.notes;

    				if (old_style_project) {
    					confirm("Looks like this project is from an older version, and unfortunately can't be opened anymore.\n" + "You can right-click it on the main screen to export or delete it from your list.\n\n" + "If you must view/edit it again, you can open it in an older version (reach me at @arijanj on Discord for help with this)");
    					window.location.reload();
    				}

    				// ughhh, have to reconstruct the functions here cause they dont serialize
    				softRegen();

    				console.log(chords_and_otherwise);
    				updateChords();
    			} else if (decision == "export-and-restart") {
    				module.export(existingProject.name).then(piece => {
    					downloadSheetData(piece);
    					importFile();
    				});
    			} else if (decision == "new") {
    				importFile();
    			}

    			importer.hide();
    		}
    	};

    	let filename;

    	let basename = s => {
    		if (!s) return;
    		return s.split(".").slice(0, -1).join('.');
    	};

    	// DOM input element
    	let fileInput;

    	let trackChooser = {
    		element: undefined,
    		hide: () => {
    			$$invalidate(8, trackChooser.element.style.top = "-110vh", trackChooser);
    		},
    		show: () => {
    			$$invalidate(8, trackChooser.element.style.top = "0px", trackChooser);
    		}
    	};

    	let sheetReady = false;
    	let MIDIObject;
    	let tracks;
    	let chords_and_otherwise;

    	// [true, true, false, true, ...]
    	let selectedTracks;

    	let container;
    	let notesContainerWidth;

    	async function onFileChange() {
    		$$invalidate(7, filename = basename(fileInput.files[0].name));
    		let exists = pieces.find(entry => entry.name == filename) ?? false;

    		if (exists) {
    			$$invalidate(0, existingProject.name = filename, existingProject); /* in history */
    			$$invalidate(0, existingProject.data = decompress(exists.data), existingProject);
    			existingProject.element.showModal();
    		} else {
    			importFile();
    			importer.hide();
    		}
    	}

    	async function importFile(dataTransfer = undefined) {
    		if (dataTransfer) $$invalidate(1, fileInput.files = dataTransfer.files, fileInput);
    		const file_is_json = fileInput.files[0].type.split("/")[1] === "json";

    		if (file_is_json) {
    			let sheetData = await fileInput.files[0].text();
    			existingProject.set(JSON.parse(sheetData));
    			$$invalidate(9, sheetReady = true);
    			$$invalidate(11, chords_and_otherwise = existingProject.data);
    			updateChords();
    			return;
    		}

    		await fileInput.files[0].arrayBuffer().then(arrbuf => {
    			$$invalidate(2, MIDIObject = getMIDIFileFromArrayBuffer(arrbuf));
    			if (!getTempo(MIDIObject).ticksPerBeat) console.error("No ticksPerBeat in this midi file");
    			$$invalidate(10, tracks = MIDIObject.tracks);
    			$$invalidate(12, selectedTracks = tracks.map(() => true));
    			$$invalidate(9, sheetReady = false);
    			trackChooser.show();
    		});
    	}

    	let saveSheet = () => {
    		if (!MIDIObject) {
    			console.log('no midiobject');
    			return;
    		}

    		let events = getEvents(MIDIObject, selectedTracks);
    		$$invalidate(11, chords_and_otherwise = generateChords(events, settings, chords_and_otherwise));
    		let only_chords = chords_and_otherwise.filter(e => is_chord(e));

    		only_chords.forEach((chord, i) => {
    			chord.next = {
    				notes: [
    					{
    						playTime: only_chords[i + 1]?.notes[0]?.playTime
    					}
    				]
    			};
    		}); // trust

    		updateChords();
    		repopulateTransposeComments();
    		$$invalidate(9, sheetReady = true);
    	};

    	// Recreate the chord with existing data for e.g. reordering purposes
    	function softRegen() {
    		if (!chords_and_otherwise) return;

    		for (let i = 0; i < chords_and_otherwise.length; i++) {
    			let chord = chords_and_otherwise[i];

    			if (is_chord(chord)) {
    				let new_notes = [];

    				for (let note of chord.notes) {
    					let new_note = new Note(note.value, note.playTime, note.tempo, note.BPM, note.delta, settings.pShifts, settings.pOors);
    					new_note.original = note.original;
    					new_notes.push(new_note);
    				}

    				let new_chord = new Chord$1(new_notes, settings.classicChordOrder, settings.sequentialQuantize);
    				new_chord.index = chord.index;
    				new_chord.next = chord.next;

    				// new_note = new_note.sort((a, b) => a.displayValue - b.displayValue);
    				$$invalidate(11, chords_and_otherwise[i].notes = new_notes, chords_and_otherwise);

    				$$invalidate(11, chords_and_otherwise[i] = new_chord, chords_and_otherwise);
    			}
    		}

    		// for (let chord of chords_and_otherwise) {
    		//     if(not_chord(chord)) continue
    		//     let notes_copy = []
    		//     for (let note of chord.notes) {
    		//         let new_note = new Note(note.value, note.playTime, note.tempo, note.BPM, note.delta, settings.pShifts, settings.pOors))
    		//         new_note.original = note.original
    		//     }
    		// }
    		updateChords();
    	}

    	let oldSettings;
    	let settings;

    	try {
    		settings = JSON.parse(localStorage.getItem('preferences'));
    		settings.beats = 4; // doesn't make sense to save this
    	} catch(e) {
    		settings = undefined;
    	}

    	let updateChords = () => {
    		$$invalidate(11, chords_and_otherwise);
    	};

    	let addComment = index => {
    		let real = real_index_of(index);

    		chords_and_otherwise.splice(real, 0, {
    			type: "comment",
    			kind: "custom",
    			text: "Add a comment..."
    		});

    		renderSelection();
    	};

    	let updateComment = (index, text) => {
    		if (text == '') chords_and_otherwise.splice(index, 1); else $$invalidate(11, chords_and_otherwise[index].text = text, chords_and_otherwise);
    		renderSelection();
    		autosave();
    	};

    	let transposeRegion = (left, right, by, opts = undefined) => {
    		let relative = opts?.relative ?? false;

    		for (let i = left; i <= chords_and_otherwise.length; i++) {
    			let chord = chord_at(i);
    			if (not_chord(chord)) continue;
    			if (chord.index > right) break;
    			transposeChord(i, by, { relative, skipUpdate: true });
    		}

    		if (opts?.skipSave === true) return;
    		repopulateTransposeComments();
    		renderSelection();
    		autosave();
    	};

    	let autoRegion = (left, right, opts = undefined) => {
    		let stickTo = opts?.stickTo ?? 0;
    		let skipSave = opts?.skipSave ?? false;
    		let chords_in_region = [];

    		for (let i = left; i <= right; i++) {
    			let selected_chord = chords_and_otherwise[real_index_of(i)];
    			chords_in_region.push(selected_chord);
    		}

    		if (stickTo == 'same') stickTo = chords_in_region[0].notes[0].transposition();
    		let best = best_transposition_for_chords(chords_in_region, 11, stickTo, settings.resilience ?? 4);
    		transposeRegion(left, right, best, { relative: false, skipSave: true });
    		repopulateTransposeComments();
    		if (!skipSave) autosave();
    		return best;
    	};

    	let repopulateTransposeComments = () => {
    		if (!chords_and_otherwise) return;
    		$$invalidate(11, chords_and_otherwise = chords_and_otherwise.filter(e => e.kind != "transpose"));
    		let first_note = next_not(chords_and_otherwise, not_chord, 0).notes[0];
    		let initial_transposition = first_note.transposition();

    		// Add first transpose comment
    		chords_and_otherwise.splice(0, 0, {
    			type: "comment",
    			kind: "transpose",
    			text: `Transpose by: ${-initial_transposition}`,
    			notop: true
    		});

    		let previous_transposition = initial_transposition;

    		for (let i = 0; i < chords_and_otherwise.length; i++) {
    			let current = chords_and_otherwise[i];
    			if (not_chord(current)) continue;
    			let transposition = current.notes[0].transposition();
    			let difference = transposition - previous_transposition;

    			if (difference != 0) {
    				// Add comment
    				let text = `Transpose by: ${-transposition > 0 ? '+' : ''}${-transposition}`;

    				text += ` (${-difference > 0 ? '+' : ''}${-difference})`;
    				let non_comment_index = i - 1;

    				// Make sure to add the transpose before all other comments for consistency
    				while (chords_and_otherwise[non_comment_index]?.type == "comment") non_comment_index--;

    				chords_and_otherwise.splice(non_comment_index + 1, 0, { type: "comment", kind: "transpose", text });
    				previous_transposition = transposition;
    			}
    		}

    		softRegen();
    		updateChords();
    		renderSelection();
    	};

    	let transposeChord = (index, by, opts) => {
    		let relative = opts?.relative ?? false; /* { relative = false, skipUpdate = false } */
    		let skipUpdate = opts?.skipUpdate ?? false;
    		let chord = chord_at(index);
    		if (not_chord(chord)) return;

    		// console.log('transposing', chord, 'by', by)
    		chord.transpose(by, relative, true); // mutate

    		if (!skipUpdate) updateChords();
    	};

    	let multiTransposeRegion = (left, right) => {
    		let regions = []; /* [{left, right}, {...}] */
    		let idx = real_index_of(left);

    		for (let i = idx; i < chords_and_otherwise.length; i++) {
    			let event = chords_and_otherwise[i] ?? undefined;

    			if (event.index >= right) {
    				regions.push({ left, right: event.index });
    				break;
    			}

    			if (event.type == "break") {
    				let next_chord = next_not(chords_and_otherwise, not_chord, i);
    				regions.push({ left, right: next_chord.index });
    				left = next_chord.index;
    			}
    		}

    		// console.log(regions)
    		let chord = chords_and_otherwise[real_index_of(regions[0].left)];

    		let previous_transposition = chord.notes[0]?.transposition() ?? 0;

    		// console.log('prevt:', previous_transposition);
    		for (let region of regions) {
    			// console.log('transposing region', region.left, region.right)
    			let best = autoRegion(region.left, region.right, {
    				stickTo: previous_transposition,
    				skipSave: true
    			});

    			previous_transposition = best;
    		} // console.log('prevt:', previous_transposition);

    		repopulateTransposeComments();
    		autosave();
    	};

    	let sheetTransposes = () => {
    		let transpose_comments = chords_and_otherwise.filter(e => e.kind == "transpose");

    		return transpose_comments.map(e => {
    			const match = e.text.match(/Transpose by:\s(\+?(-?\d+))/);
    			return match ? match[2] : null;
    		}).join(' ');
    	};

    	/**
     * Takes an image of the sheet, which can then be either copied/downloaded.
     * The image should be cropped to the maximum measure length via the value notesContainerWidth.
     * It's value depends on the max-content width of the div where notesContainerWidth is set.
     * @param {string} mode - A string indicating how the user wants to retrieve the image.
     * @enum {string} ["download", "copy"]
     */
    	function captureSheetAsImage(mode) {
    		$$invalidate(3, settings.capturingImage = true, settings);
    		$$invalidate(3, settings.oorMarks = false, settings);

    		// Widen actual container to prevent cutoff
    		$$invalidate(13, container.firstChild.style.width = `${notesContainerWidth + 1}px`, container);

    		setTimeout(
    			() => Yt(container, { width: notesContainerWidth, scale: 2 }).then(blob => {
    				if (mode === "copy") {
    					copyCapturedImage(blob);
    				} else {
    					downloadCapturedImage(blob);
    				}

    				$$invalidate(3, settings.capturingImage = false, settings);

    				// Restore original element size
    				$$invalidate(13, container.firstChild.style.width = 'max-content', container);
    			}),
    			250
    		);
    	}

    	function downloadCapturedImage(blob) {
    		download(blob, "png");
    	}

    	function downloadSheetData(piece) {
    		$$invalidate(7, filename = piece.name);
    		let blob = new Blob([JSON.stringify(piece)], { type: "text/json" });
    		download(blob, "json");
    	}

    	function download(blob, extension) {
    		const url = URL.createObjectURL(blob);
    		let output = `${filename}.${extension}`;

    		// create a temporary element to download the data
    		let linkEl = document.createElement("a");

    		linkEl.href = url;
    		linkEl.download = output;
    		document.body.appendChild(linkEl);
    		linkEl.click();
    		URL.revokeObjectURL(url);
    		document.body.removeChild(linkEl);
    	}

    	function droppedFile(e) {
    		e.preventDefault();
    		let file = e?.dataTransfer?.items?.[0];

    		if (!file || !file.getAsFile) {
    			console.error('bad file dropped');
    			return;
    		}

    		$$invalidate(1, fileInput.files = e.dataTransfer.files, fileInput);
    		onFileChange();
    	}

    	function clearFiles() {
    		$$invalidate(11, chords_and_otherwise = undefined);
    		document.getElementById("drop").value = "";
    	}

    	let pieces = module.getAll();

    	if (pieces.length == 0 && !localStorage.getItem('hadSample')) {
    		localStorage.setItem('hadSample', true);

    		fetch(sample_uri).then(response => response.json()).then(other => {
    			module.add(other.name, other.settings, other.data, true);

    			setTimeout(
    				() => {
    					$$invalidate(15, pieces = module.getAll($$invalidate(6, remaining = remainingSize())));
    				},
    				0
    			);
    		});
    	}

    	function autosave() {
    		if (filename) module.add(filename, settings, chords_and_otherwise).then(() => $$invalidate(15, pieces = module.getAll()));
    		$$invalidate(6, remaining = remainingSize());
    		console.log('saving', chords_and_otherwise);
    		return;
    	}

    	let has_selection = false;
    	let selection = { left: undefined, right: undefined };

    	function resetSelection(e) {
    		if (!sheetReady || !selection.left && !selection.right) return;

    		for (let i = selection.left; i < chords_and_otherwise.length; i++) {
    			const chord = chords_and_otherwise[i];
    			if (not_chord(chord)) continue;
    			if (chord.index > selection.right) break;
    			chord.selected = undefined;
    		}

    		$$invalidate(4, selection.left = undefined, selection);
    		$$invalidate(4, selection.right = undefined, selection);

    		// for (let event of chords_and_otherwise) {
    		//     if (is_chord(event)) {
    		//         event.selected = undefined
    		//     }
    		// }
    		updateChords();
    	}

    	function selectAll() {
    		$$invalidate(4, selection.left = 0, selection);
    		$$invalidate(4, selection.right = chords_and_otherwise.length - 1, selection);
    		renderSelection();
    	}

    	function renderSelection(e) {
    		if (!chords_and_otherwise) return;

    		// console.log('rendering', selection)
    		// Deselect everything
    		for (let i = selection.left; i < chords_and_otherwise.length; i++) {
    			let chord = chords_and_otherwise[real_index_of(i)];
    			if (not_chord(chord)) continue;
    			chord.selected = undefined;
    			if (i > chord.index) break;
    		}

    		// Select pertinent part
    		for (let i = selection.left; i <= selection.right; i++) {
    			let chord = chords_and_otherwise[real_index_of(i)];
    			if (!chord) continue;
    			if (chord.index > selection.right) break;
    			chord.selected = true;
    		}

    		updateChords();
    	}

    	function setSelection(event_or_index) {
    		let index = event_or_index.detail?.index ?? event_or_index;

    		// Double-click to select line
    		if (selection.left === index && selection.right === index) {
    			// Find line bounds
    			let left = real_index_of(index);

    			// console.log(left)
    			while (is_chord(chords_and_otherwise[left])) {
    				left--;
    			}

    			left++;
    			let right = left;

    			while (is_chord(chords_and_otherwise[right])) {
    				right++;
    			}

    			right--;
    			$$invalidate(4, selection.left = chords_and_otherwise[left].index, selection);
    			$$invalidate(4, selection.right = chords_and_otherwise[right].index, selection);
    		} else // Swap left and right if needed
    		if (index < selection.left || selection.left === undefined) {
    			$$invalidate(4, selection.right = selection.left ?? index, selection);
    			$$invalidate(4, selection.left = index, selection);
    		} else {
    			$$invalidate(4, selection.right = index, selection);
    		}

    		renderSelection();
    	}

    	function splitLineAt(index) {
    		let real_index = real_index_of(index);
    		chords_and_otherwise.splice(real_index, 0, { type: "break" });
    		updateChords();
    	}

    	function joinRegion(left, right) {
    		let start = real_index_of(chords_and_otherwise, left);

    		for (let i = start; i < chords_and_otherwise.length; i++) {
    			if (chords_and_otherwise[i]?.type == "break") {
    				chords_and_otherwise.splice(i, 1);
    				i--;
    			}

    			if (i > real_index_of(chords_and_otherwise, right)) break;
    		}

    		updateChords();
    	}

    	function continueTranspose(direction) {
    		let start = direction == 'ltr' ? selection.left : selection.right; /* 'ltr' or 'rtl' */
    		let transposition = chords_and_otherwise[real_index_of(start)].notes[0].transposition();
    		transposeRegion(selection.left, selection.right, transposition);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function contextmenu_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function contextmenu_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function contextmenu_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function dragover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const keydown_handler = e => {
    		if (e.key == "Escape") resetSelection();

    		if (e.key == "b") {
    			console.log(chord_at(selection.left));
    		}
    	};

    	function dialog_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			existingProject.element = $$value;
    			$$invalidate(0, existingProject);
    		});
    	}

    	const close_handler = () => {
    		existingProject.proceed();
    	};

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			fileInput = $$value;
    			$$invalidate(1, fileInput);
    		});
    	}

    	const load_handler = x => {
    		existingProject.setAndProceed(x.detail.project);
    		importer.hide();
    	};

    	const refresh_handler = () => {
    		$$invalidate(15, pieces = module.getAll());
    		$$invalidate(6, remaining = remainingSize());
    	};

    	const export_handler = piece => downloadSheetData(piece);

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			importer.element = $$value;
    			$$invalidate(5, importer);
    		});
    	}

    	const click_handler_1 = () => {
    		importer.show();

    		setTimeout(
    			() => {
    				$$invalidate(9, sheetReady = false);
    				$$invalidate(7, filename = null);
    				clearFiles();
    			},
    			600
    		);
    	};

    	const click_handler_2 = () => {
    		transposeRegion(selection.left, selection.right, 1, { relative: true });
    		repopulateTransposeComments();
    	};

    	const click_handler_3 = () => {
    		transposeRegion(selection.left, selection.right, -1, { relative: true });
    		repopulateTransposeComments();
    	};

    	const click_handler_4 = () => {
    		autoRegion(selection.left, selection.right);
    	};

    	const click_handler_5 = () => {
    		multiTransposeRegion(selection.left, selection.right);
    	};

    	const click_handler_6 = () => {
    		splitLineAt(selection.left);
    	};

    	const click_handler_7 = () => {
    		joinRegion(selection.left, selection.right);
    	};

    	const click_handler_8 = () => {
    		addComment(selection.left);
    	};

    	const click_handler_9 = () => {
    		continueTranspose('rtl');
    	};

    	const click_handler_10 = () => {
    		continueTranspose('ltr');
    	};

    	function sheetoptions_settings_binding(value) {
    		settings = value;
    		$$invalidate(3, settings);
    	}

    	function track_selected_binding(value, idx) {
    		if ($$self.$$.not_equal(selectedTracks[idx], value)) {
    			selectedTracks[idx] = value;
    			$$invalidate(12, selectedTracks);
    		}
    	}

    	const click_handler_11 = () => {
    		saveSheet();
    		trackChooser.hide();
    	};

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			trackChooser.element = $$value;
    			$$invalidate(8, trackChooser);
    		});
    	}

    	const captureSheetAsImage_handler = event => {
    		captureSheetAsImage(event.detail.mode);
    	};

    	const copyText_handler = () => {
    		$$invalidate(3, settings.tempoMarks = true, settings);
    		$$invalidate(3, settings.oorMarks = true, settings);

    		setTimeout(
    			() => {
    				navigator.clipboard.writeText(container.firstChild.innerText);
    			},
    			0
    		);
    	};

    	const copyTransposes_handler = () => {
    		navigator.clipboard.writeText(sheetTransposes());
    	};

    	const export_handler_1 = () => {
    		autosave();

    		setTimeout(
    			() => {
    				if (existingProject?.data === undefined) {
    					let pieces = module.getAll();
    					let thisPiece = pieces.filter(entry => entry.name === filename)[0];
    					existingProject.setAndProceed(thisPiece, true);
    				}

    				module.export(existingProject.name).then(piece => downloadSheetData(piece));
    			},
    			0
    		);
    	};

    	const focusout_handler = (index, e) => {
    		updateComment(index, e.target.innerText);
    	};

    	function div0_elementresize_handler() {
    		notesContainerWidth = this.clientWidth;
    		$$invalidate(14, notesContainerWidth);
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(13, container);
    		});
    	}

    	$$self.$capture_state = () => ({
    		domToBlob: Yt,
    		getMIDIFileFromArrayBuffer,
    		getEvents,
    		getTempo,
    		generateChords,
    		best_transposition_for_chords,
    		ChordObject: Chord$1,
    		Note,
    		is_chord,
    		not_chord,
    		index_of_index,
    		real_index_of,
    		chord_at,
    		SheetOptions,
    		Track,
    		Chord,
    		HistoryEntry,
    		importer,
    		history: module,
    		decompress,
    		remainingSize,
    		remaining,
    		sample_uri,
    		SheetActions,
    		Guide,
    		existingProject,
    		filename,
    		basename,
    		fileInput,
    		trackChooser,
    		sheetReady,
    		MIDIObject,
    		tracks,
    		chords_and_otherwise,
    		selectedTracks,
    		container,
    		notesContainerWidth,
    		onFileChange,
    		importFile,
    		saveSheet,
    		softRegen,
    		oldSettings,
    		settings,
    		updateChords,
    		addComment,
    		updateComment,
    		transposeRegion,
    		autoRegion,
    		repopulateTransposeComments,
    		transposeChord,
    		multiTransposeRegion,
    		sheetTransposes,
    		captureSheetAsImage,
    		copyCapturedImage,
    		downloadCapturedImage,
    		downloadSheetData,
    		download,
    		droppedFile,
    		clearFiles,
    		pieces,
    		autosave,
    		next_not,
    		has_selection,
    		selection,
    		resetSelection,
    		selectAll,
    		renderSelection,
    		setSelection,
    		splitLineAt,
    		joinRegion,
    		continueTranspose
    	});

    	$$self.$inject_state = $$props => {
    		if ('real_index_of' in $$props) real_index_of = $$props.real_index_of;
    		if ('chord_at' in $$props) $$invalidate(17, chord_at = $$props.chord_at);
    		if ('importer' in $$props) $$invalidate(5, importer = $$props.importer);
    		if ('remaining' in $$props) $$invalidate(6, remaining = $$props.remaining);
    		if ('existingProject' in $$props) $$invalidate(0, existingProject = $$props.existingProject);
    		if ('filename' in $$props) $$invalidate(7, filename = $$props.filename);
    		if ('basename' in $$props) $$invalidate(76, basename = $$props.basename);
    		if ('fileInput' in $$props) $$invalidate(1, fileInput = $$props.fileInput);
    		if ('trackChooser' in $$props) $$invalidate(8, trackChooser = $$props.trackChooser);
    		if ('sheetReady' in $$props) $$invalidate(9, sheetReady = $$props.sheetReady);
    		if ('MIDIObject' in $$props) $$invalidate(2, MIDIObject = $$props.MIDIObject);
    		if ('tracks' in $$props) $$invalidate(10, tracks = $$props.tracks);
    		if ('chords_and_otherwise' in $$props) $$invalidate(11, chords_and_otherwise = $$props.chords_and_otherwise);
    		if ('selectedTracks' in $$props) $$invalidate(12, selectedTracks = $$props.selectedTracks);
    		if ('container' in $$props) $$invalidate(13, container = $$props.container);
    		if ('notesContainerWidth' in $$props) $$invalidate(14, notesContainerWidth = $$props.notesContainerWidth);
    		if ('saveSheet' in $$props) $$invalidate(19, saveSheet = $$props.saveSheet);
    		if ('oldSettings' in $$props) $$invalidate(38, oldSettings = $$props.oldSettings);
    		if ('settings' in $$props) $$invalidate(3, settings = $$props.settings);
    		if ('updateChords' in $$props) updateChords = $$props.updateChords;
    		if ('addComment' in $$props) $$invalidate(20, addComment = $$props.addComment);
    		if ('updateComment' in $$props) $$invalidate(21, updateComment = $$props.updateComment);
    		if ('transposeRegion' in $$props) $$invalidate(22, transposeRegion = $$props.transposeRegion);
    		if ('autoRegion' in $$props) $$invalidate(23, autoRegion = $$props.autoRegion);
    		if ('repopulateTransposeComments' in $$props) $$invalidate(24, repopulateTransposeComments = $$props.repopulateTransposeComments);
    		if ('transposeChord' in $$props) transposeChord = $$props.transposeChord;
    		if ('multiTransposeRegion' in $$props) $$invalidate(25, multiTransposeRegion = $$props.multiTransposeRegion);
    		if ('sheetTransposes' in $$props) $$invalidate(26, sheetTransposes = $$props.sheetTransposes);
    		if ('pieces' in $$props) $$invalidate(15, pieces = $$props.pieces);
    		if ('has_selection' in $$props) $$invalidate(16, has_selection = $$props.has_selection);
    		if ('selection' in $$props) $$invalidate(4, selection = $$props.selection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*fileInput, existingProject*/ 3) {
    			{
    				if (fileInput) $$invalidate(7, filename = basename(fileInput.files[0]?.name) ?? existingProject.name);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*settings, MIDIObject*/ 12 | $$self.$$.dirty[1] & /*oldSettings*/ 128) {
    			$: {
    				if (!oldSettings) {
    					$$invalidate(38, oldSettings = { ...settings });
    					break $;
    				}

    				let changed = key => settings[key] != oldSettings[key];

    				if ([
    					"beats",
    					"classicChordOrder",
    					"quantize",
    					"sequentialQuantize",
    					"minSpeedChange",
    					"bpmChanges",
    					"bpm"
    				].some(changed)) saveSheet(); // Full regeneration needed

    				// Regeneration that doesn't require a MIDIObject
    				if ([
    					"pShifts",
    					"pOors",
    					"classicChordOrder",
    					"quantize",
    					"sequentialQuantize"
    				].some(changed)) softRegen();

    				if (MIDIObject) localStorage.setItem('preferences', JSON.stringify(settings));
    				renderSelection();
    				$$invalidate(38, oldSettings = { ...settings });
    			}
    		}

    		if ($$self.$$.dirty[0] & /*selection*/ 16) {
    			{
    				$$invalidate(16, has_selection = selection.left != undefined && selection.right != undefined);
    			} // print("Selection: ", selection)
    		}
    	};

    	return [
    		existingProject,
    		fileInput,
    		MIDIObject,
    		settings,
    		selection,
    		importer,
    		remaining,
    		filename,
    		trackChooser,
    		sheetReady,
    		tracks,
    		chords_and_otherwise,
    		selectedTracks,
    		container,
    		notesContainerWidth,
    		pieces,
    		has_selection,
    		chord_at,
    		onFileChange,
    		saveSheet,
    		addComment,
    		updateComment,
    		transposeRegion,
    		autoRegion,
    		repopulateTransposeComments,
    		multiTransposeRegion,
    		sheetTransposes,
    		captureSheetAsImage,
    		downloadSheetData,
    		droppedFile,
    		clearFiles,
    		autosave,
    		resetSelection,
    		selectAll,
    		setSelection,
    		splitLineAt,
    		joinRegion,
    		continueTranspose,
    		oldSettings,
    		contextmenu_handler,
    		click_handler,
    		keypress_handler,
    		contextmenu_handler_1,
    		contextmenu_handler_2,
    		dragover_handler,
    		keydown_handler,
    		dialog_binding,
    		close_handler,
    		input_binding,
    		load_handler,
    		refresh_handler,
    		export_handler,
    		div2_binding,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		sheetoptions_settings_binding,
    		track_selected_binding,
    		click_handler_11,
    		section_binding,
    		captureSheetAsImage_handler,
    		copyText_handler,
    		copyTransposes_handler,
    		export_handler_1,
    		focusout_handler,
    		div0_elementresize_handler,
    		div1_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1, -1, -1]);

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
