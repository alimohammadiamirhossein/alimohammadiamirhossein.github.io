import * as assert from "assert";

type CVInfo = {
    picture: string,
    description?: string,
    relDistance?: number;
    relSize?: number;
}

export type CVItem = {
    picture: string,
    description?: string,
    depth: number
    relDistance: number;
    relSize: number;
}

export type Tree = {
    item: CVItem,
    children: Tree[]
}

const rootItem: CVItem = {picture: "/static/images/Amir.jpg", depth: 0, relSize: 1, relDistance: 1};
const tree = {item: rootItem, children: []};


function findItem(item: CVInfo): Tree {
    function walkTree(tree: Tree): Tree | undefined {
        if (tree.item === item)
            return tree;
        for (const subTree of tree.children) {
            const res = walkTree(subTree);
            if (res !== undefined)
                return res;
        }
        return undefined;
    }
    return walkTree(tree) ?? assert.fail();
}

function addItem(info: CVInfo, parent: CVInfo): CVInfo {
    const parentTree = findItem(parent);
    const item: CVItem = {
        description: info.description,
        picture: info.picture,
        depth: parentTree.item.depth + 1,
        relDistance: info.relDistance ?? parentTree.item.relDistance * 0.6,
        relSize: info.relSize ?? parentTree.item.relSize * 0.65
    };
    parentTree.children.push({item: item, children: []});
    return item;
}

export function getTree() {
    return tree;
}

const cvNode = addItem({
    description: "You can download a more formal resume <a href=\"/static/CV.pdf\">here</a>",
    picture: "/static/images/cv.jpg",
}, rootItem);

const highSchoolNode = addItem({
    description: "Studied in Salam HighSchool 2015-2018 (Tehran, Iran)<br/>\
                  Taught Math Olympiad topics, including Number Theory and Algebra, from 2019 to 2021. <br/>",
    picture: "/static/images/salam.jpg"
}, rootItem);

const yscNode = addItem({
    description: "Achieved a Gold Medal in the 35th Iranian National Olympiad in Mathematics.<br/>\
                                Became a member of young scholars club",
    picture: "/static/images/ysc.jpg"
}, highSchoolNode);

const imcNode = addItem({
    description: "Silver Medalist, International Mathematics Competition 2016, Thailand</br>Bronze Medalist, International Mathematics Competition 2015, China",
    picture: "/static/images/imc.png"
}, highSchoolNode);

const sharifNode = addItem({
    description: "Sharif University of Technology (Tehran, Iran)<br>" +
        "B.Sc. Computer Engineering, 2018-2023<br>" +
        "GPA - 18.09/20",
    picture: "/static/images/sharif.jpg"
}, rootItem);

const thesisNode = addItem({
    description: "Bachelor Thesis: <a href=\"/static/CV.pdf\">CryptoPredictions</a></br>" +
        "Implemented an open-source library for predicting and forecasting cryptocurrency prices.<br/>" +
        "The library includes 9 models, 10 metrics, and over 30 indicators, and supports more than 15 popular cryptocurrencies.",
    picture: "/static/images/thesis.png"
}, sharifNode);

// Social Node section
const socialNode = addItem({
    picture: "/static/images/social.jpg"
}, rootItem);

addItem({
    description: "aaa324@sfu.ca",
    picture: "/static/images/email.jpg",
}, socialNode);

addItem({
    description: "<a href=\"https://www.linkedin.com/in/alimohammadi-amirhossein/\">LinkedIn</a>",
    picture: "/static/images/linkedin.jpg",
}, socialNode);

addItem({
    description: "<a href=\"https://github.com/alimohammadiamirhossein\">Github</a>",
    picture: "/static/images/github.jpg",
}, socialNode);



