"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var settings_1 = require("./settings");
var query_1 = require("./DataProcessing/query");
var GraphToQuery_1 = require("./DataProcessing/GraphToQuery");
var Graph_1 = require("./Graph/Graph");
var SubGraph_1 = require("./Graph/SubGraph");
//Execution of the script
//GenerateGraph(command);
function GenerateGraph(settings) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var combinedGraph, k, graph, subGraph, _a, _b, _c, _d, _e, _f, i;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                combinedGraph = new Graph_1.Graph(settings.name);
                                k = 0;
                                _g.label = 1;
                            case 1:
                                if (!(k < settings.graphs.length)) return [3 /*break*/, 9];
                                graph = settings.graphs[k];
                                subGraph = new SubGraph_1.SubGraph(graph.name, graph.inputColor, graph.renderColor);
                                //Convert Transaction commands into bundles
                                _a = graph;
                                _c = (_b = graph.addressesToSearch).concat;
                                return [4 /*yield*/, query_1.QueryTransactions(graph.TxsToSearch)];
                            case 2:
                                //Convert Transaction commands into bundles
                                _a.addressesToSearch = _c.apply(_b, [_g.sent()]);
                                //Convert Bundle commands into addresses
                                _d = graph;
                                _f = (_e = graph.addressesToSearch).concat;
                                return [4 /*yield*/, query_1.QueryBundles(graph.bundlesToSearch, query_1.DIRECTION.BACKWARD, false)];
                            case 3:
                                //Convert Bundle commands into addresses
                                _d.addressesToSearch = _f.apply(_e, [_g.sent()]);
                                i = 0;
                                _g.label = 4;
                            case 4:
                                if (!(i < graph.addressesToSearch.length)) return [3 /*break*/, 7];
                                //DatabaseManager.ImportFromCSV("Cache", graph.addressesToSearch[i]);
                                return [4 /*yield*/, query_1.QueryAddress(graph.addressesToSearch[i], settings_1.maxQueryDepth, undefined, undefined, function (processedTXCount, foundTXCount, depth) {
                                        console.log(processedTXCount + "/" + foundTXCount + " with depth " + depth);
                                    })];
                            case 5:
                                //DatabaseManager.ImportFromCSV("Cache", graph.addressesToSearch[i]);
                                _g.sent();
                                //Cache Results
                                //let cacheExporter = new GraphExporter(graph.addressesToSearch[i]);
                                //cacheExporter.AddAddressSubGraph(graph.addressesToSearch[i]);
                                //cacheExporter.ExportToCSV("Cache");
                                //Add to Subgraph
                                subGraph.AddAddress(graph.addressesToSearch[i]);
                                _g.label = 6;
                            case 6:
                                i++;
                                return [3 /*break*/, 4];
                            case 7:
                                subGraph.ExportAllUnspentAddressHashes("Database");
                                subGraph.ExportAllTransactionHashes("Database");
                                //Export commands
                                //let exporter = new GraphExporter(graph.name);
                                //exporter.AddAll();
                                //Export(exporter);
                                //console.log("Unspent value in end addresses from "+graph.name+": " + exporter.GetUnspentValue());
                                //Add Subgraph to main graph and optionally render
                                if (settings.seperateRender) {
                                    subGraph.ExportToDOT();
                                }
                                if (graph.renderType == GraphToQuery_1.RenderType.ADD) {
                                    combinedGraph.SubGraphAddition(subGraph);
                                }
                                else if (graph.renderType == GraphToQuery_1.RenderType.SUBTRACT) {
                                    combinedGraph.SubGraphSubtraction(subGraph, true);
                                }
                                _g.label = 8;
                            case 8:
                                k++;
                                return [3 /*break*/, 1];
                            case 9:
                                //Combined
                                combinedGraph.ExportToDOT();
                                resolve(combinedGraph);
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.GenerateGraph = GenerateGraph;
function Update() {
}
exports.Update = Update;
function Export(exporter) {
    if (settings_1.command.seperateRender) {
        exporter.ExportToDOT();
    }
    if (settings_1.command.outputAllAddresses) {
        exporter.ExportAllAddressHashes("Database");
    }
    if (settings_1.command.outputAllBundles) {
        exporter.ExportAllBundleHashes("Database");
    }
    if (settings_1.command.outputAllTxs) {
        exporter.ExportAllTransactionHashes("Database");
    }
    if (settings_1.command.outputAllPositiveAddresses) {
        exporter.ExportAllUnspentAddressHashes("Database");
    }
}
//# sourceMappingURL=main.js.map